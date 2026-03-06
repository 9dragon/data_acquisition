/**
 * Upload progress modal component
 */

import React, { useState, useEffect } from 'react';
import { Modal, Progress, List, Tag, Button, Space, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadProgress } from '../../services/fileUploadService';

export interface FileUploadItem {
  id: string;
  file: File;
  status: 'waiting' | 'uploading' | 'success' | 'error';
  progress: UploadProgress;
  result?: { success: boolean; fileUrl?: string; filePath?: string; error?: string };
}

interface UploadProgressModalProps {
  visible: boolean;
  files: File[];
  onClose: () => void;
  onComplete: (results: FileUploadItem[]) => void;
}

const UploadProgressModal: React.FC<UploadProgressModalProps> = ({
  visible,
  files,
  onClose,
  onComplete,
}) => {
  const [uploadItems, setUploadItems] = useState<FileUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Reset upload items when modal opens
  useEffect(() => {
    if (visible && files.length > 0) {
      const items: FileUploadItem[] = files.map((file, index) => ({
        id: `upload-${Date.now()}-${index}`,
        file,
        status: 'waiting',
        progress: { loaded: 0, total: file.size, percent: 0 },
      }));
      setUploadItems(items);

      // Start upload automatically
      setTimeout(() => startUpload(items), 500);
    }
  }, [visible, files]);

  const startUpload = async (items: FileUploadItem[]) => {
    setIsUploading(true);

    // Import dynamically to avoid circular dependency
    const { uploadFile } = await import('../../services/fileUploadService');

    // Upload files sequentially
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Update status to uploading
      setUploadItems(prev =>
        prev.map(p =>
          p.id === item.id
            ? { ...p, status: 'uploading' as const }
            : p
        )
      );

      try {
        // Upload file with progress callback
        const result = await uploadFile(item.file, (progress) => {
          setUploadItems(prev =>
            prev.map(p =>
              p.id === item.id
                ? { ...p, progress }
                : p
            )
          );
        });

        // Update status based on result
        setUploadItems(prev =>
          prev.map(p =>
            p.id === item.id
              ? {
                  ...p,
                  status: result.success ? 'success' : 'error',
                  result,
                }
              : p
          )
        );
      } catch (error) {
        // Handle upload error
        setUploadItems(prev =>
          prev.map(p =>
            p.id === item.id
              ? {
                  ...p,
                  status: 'error',
                  result: {
                    success: false,
                    error: error instanceof Error ? error.message : '上传失败'
                  }
                }
              : p
          )
        );
      }
    }

    setIsUploading(false);
  };

  const handleClose = () => {
    if (isUploading) {
      return; // Don't allow closing while uploading
    }
    onComplete(uploadItems);
    onClose();
  };

  const getStatusIcon = (status: FileUploadItem['status']) => {
    switch (status) {
      case 'waiting':
        return <Tag color="default">等待中</Tag>;
      case 'uploading':
        return <Tag color="processing" icon={<LoadingOutlined />}>上传中</Tag>;
      case 'success':
        return <Tag color="success" icon={<CheckCircleOutlined />}>成功</Tag>;
      case 'error':
        return <Tag color="error" icon={<CloseCircleOutlined />}>失败</Tag>;
    }
  };

  const allComplete = uploadItems.every(item => item.status === 'success' || item.status === 'error');
  const hasErrors = uploadItems.some(item => item.status === 'error');
  const successCount = uploadItems.filter(item => item.status === 'success').length;

  return (
    <Modal
      title="文件上传"
      open={visible}
      onCancel={handleClose}
      footer={
        <Space>
          <Button onClick={handleClose} disabled={isUploading}>
            {allComplete ? '关闭' : '取消'}
          </Button>
        </Space>
      }
      width={700}
      maskClosable={!isUploading}
      closable={!isUploading}
    >
      {allComplete && hasErrors && (
        <Alert
          message={`上传完成，成功 ${successCount} 个，失败 ${uploadItems.length - successCount} 个`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {allComplete && !hasErrors && (
        <Alert
          message={`成功上传 ${successCount} 个文件`}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <List
        dataSource={uploadItems}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={getStatusIcon(item.status)}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{item.file.name}</span>
                  <span style={{ fontSize: 12, color: '#999' }}>
                    {(item.file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              }
              description={
                <div>
                  {item.status === 'uploading' && (
                    <Progress
                      percent={item.progress.percent}
                      size="small"
                      status="active"
                    />
                  )}
                  {item.status === 'error' && item.result?.error && (
                    <div style={{ color: '#ff4d4f', fontSize: 12 }}>
                      {item.result.error}
                    </div>
                  )}
                  {item.status === 'success' && (
                    <div style={{ color: '#52c41a', fontSize: 12 }}>
                      文件已成功上传
                    </div>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />

      {isUploading && (
        <div style={{ marginTop: 16, textAlign: 'center', color: '#999', fontSize: 12 }}>
          正在上传文件，请稍候...
        </div>
      )}
    </Modal>
  );
};

export default UploadProgressModal;
