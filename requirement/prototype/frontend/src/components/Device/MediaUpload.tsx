import React, { useState } from 'react';
import { Upload, Modal, message, Progress } from 'antd';
import { PlusOutlined, PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MediaAttachment } from '../../types/device';

interface MediaUploadProps {
  value?: MediaAttachment[];
  onChange?: (files: MediaAttachment[]) => void;
  acceptType?: 'image' | 'video' | 'both';
  maxCount?: number;
  disabled?: boolean;
  maxSize?: number; // MB
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  value = [],
  onChange,
  acceptType = 'both',
  maxCount = 10,
  disabled = false,
  maxSize = 10,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, number>>({});

  // 根据acceptType确定接受的文件类型
  const getAccept = () => {
    switch (acceptType) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'both':
        return 'image/*,video/*';
      default:
        return '*';
    }
  };

  // 判断是否为图片
  const isImage = (type: string) => type.startsWith('image/');

  // 判断是否为视频
  const isVideo = (type: string) => type.startsWith('video/');

  // 处理文件上传前的验证
  const beforeUpload = (file: File) => {
    const fileType = file.type;
    const isAcceptable =
      (acceptType === 'image' && isImage(fileType)) ||
      (acceptType === 'video' && isVideo(fileType)) ||
      (acceptType === 'both' && (isImage(fileType) || isVideo(fileType)));

    if (!isAcceptable) {
      message.error(`只能上传${acceptType === 'image' ? '图片' : acceptType === 'video' ? '视频' : '图片或视频'}文件！`);
      return false;
    }

    const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtMaxSize) {
      message.error(`文件大小不能超过 ${maxSize}MB！`);
      return false;
    }

    if (value.length >= maxCount) {
      message.error(`最多只能上传 ${maxCount} 个文件！`);
      return false;
    }

    return true;
  };

  // 处理文件上传
  const handleUpload = (file: File) => {
    if (!beforeUpload(file)) {
      return false;
    }

    const fileId = `temp_${Date.now()}`;
    const fileUrl = URL.createObjectURL(file);

    // 模拟上传进度
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadingFiles(prev => ({ ...prev, [fileId]: progress }));

      if (progress >= 100) {
        clearInterval(interval);

        // 创建新的附件对象
        const newAttachment: MediaAttachment = {
          id: fileId,
          name: file.name,
          url: fileUrl,
          type: isImage(file.type) ? 'image' : 'video',
          size: file.size,
          uploadTime: new Date().toISOString(),
        };

        // 更新文件列表
        const newValue = [...value, newAttachment];
        if (onChange) {
          onChange(newValue);
        }

        // 清除进度
        setUploadingFiles(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });

        message.success(`${file.name} 上传成功！`);
      }
    }, 100);

    return false; // 阻止自动上传
  };

  // 处理预览
  const handlePreview = (file: MediaAttachment) => {
    if (file.type === 'image') {
      setPreviewImage(file.url);
      setPreviewTitle(file.name);
      setPreviewOpen(true);
    } else if (file.type === 'video') {
      setVideoPreviewUrl(file.url);
      setVideoPreviewOpen(true);
    }
  };

  // 处理删除
  const handleRemove = (file: MediaAttachment) => {
    const newValue = value.filter(item => item.id !== file.id);
    if (onChange) {
      onChange(newValue);
    }
    message.success(`已删除 ${file.name}`);
  };

  // 渲染上传按钮
  const uploadButton = (
    <button style={{ border: 0, background: 'none', cursor: 'pointer' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </button>
  );

  // 渲染文件项
  const renderUploadItem = (file: MediaAttachment) => {
    const isUploading = file.id.startsWith('temp_') && uploadingFiles[file.id] !== undefined;
    const uploadProgress = uploadingFiles[file.id] || 0;

    return (
      <div
        key={file.id}
        style={{
          position: 'relative',
          width: 104,
          height: 104,
          margin: '0 8px 8px 0',
          border: '1px solid #d9d9d9',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {file.type === 'image' ? (
          <img
            src={file.url}
            alt={file.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              cursor: 'pointer',
            }}
            onClick={() => !disabled && handlePreview(file)}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: '#fafafa',
            }}
            onClick={() => !disabled && handlePreview(file)}
          >
            <PlayCircleOutlined style={{ fontSize: 32, color: '#1890ff' }} />
            <div style={{ fontSize: 12, marginTop: 4, padding: '0 4px', textAlign: 'center', wordBreak: 'break-all' }}>
              {file.name}
            </div>
          </div>
        )}

        {isUploading && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 4, background: 'rgba(0,0,0,0.5)' }}>
            <Progress percent={uploadProgress} size="small" showInfo={false} strokeColor="#1890ff" />
          </div>
        )}

        {!disabled && (
          <div
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              background: 'rgba(0,0,0,0.6)',
              borderRadius: '50%',
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleRemove(file);
            }}
          >
            <DeleteOutlined style={{ color: '#fff', fontSize: 12 }} />
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '2px 4px',
            background: 'rgba(0,0,0,0.5)',
            color: '#fff',
            fontSize: 10,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {file.name}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {value.map(file => renderUploadItem(file))}

        {!disabled && value.length < maxCount && (
          <Upload
            accept={getAccept()}
            showUploadList={false}
            beforeUpload={handleUpload}
            disabled={disabled}
            style={{ display: 'inline-block' }}
          >
            <div
              style={{
                width: 104,
                height: 104,
                border: '1px dashed #d9d9d9',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: '#fafafa',
              }}
            >
              {uploadButton}
            </div>
          </Upload>
        )}
      </div>

      {value.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
          共 {value.length} 个文件，最多可上传 {maxCount} 个
        </div>
      )}

      {/* 图片预览 */}
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        width="80%"
        style={{ top: 20 }}
      >
        <img alt={previewTitle} style={{ width: '100%' }} src={previewImage} />
      </Modal>

      {/* 视频预览 */}
      <Modal
        open={videoPreviewOpen}
        title="视频预览"
        footer={null}
        onCancel={() => setVideoPreviewOpen(false)}
        width="80%"
        style={{ top: 20 }}
      >
        <video
          src={videoPreviewUrl}
          controls
          style={{ width: '100%' }}
          autoPlay
        />
      </Modal>
    </div>
  );
};

export default MediaUpload;
