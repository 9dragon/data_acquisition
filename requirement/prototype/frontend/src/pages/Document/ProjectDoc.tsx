import React, { useState } from 'react';
import { Card, Space, Button, Tag, Upload, Modal, message } from 'antd';
import { UploadOutlined, FileOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import FilterBar from '../../components/Common/FilterBar';
import DataTable from '../../components/Common/DataTable';
import StatusTag from '../../components/Common/StatusTag';
import UploadProgressModal, { FileUploadItem } from '../../components/Document/UploadProgressModal';
import { useDocumentStore } from '../../stores/documentStore';
import { mockDocuments, mockProjects, mockDocumentTags } from '../../services/mockData';
import { downloadFile } from '../../services/fileUploadService';
import { getFileIcon, canPreviewFile, validateFile } from '../../utils/fileHelpers';
import type { ColumnsType } from 'antd/es/table';
import type { Document } from '../../types/document';

const ProjectDoc: React.FC = () => {
  const navigate = useNavigate();
  const { documents } = useDocumentStore();
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  const documentsWithProjectName = documents.map(doc => ({
    ...doc,
    projectName: mockProjects.find(p => p.id === doc.projectId)?.name || '',
  }));

  const filters = [
    { name: 'name', label: '文档名称', type: 'input' as const, placeholder: '请输入文档名称' },
    { name: 'projectId', label: '所属项目', type: 'select' as const, placeholder: '请选择项目', options: [
      ...mockProjects.map(p => ({ label: p.name, value: p.id })),
    ]},
    { name: 'type', label: '文档类型', type: 'select' as const, placeholder: '请选择类型', options: [
      { label: '需求文档', value: 'requirement' },
      { label: '设计文档', value: 'design' },
      { label: '操作手册', value: 'manual' },
      { label: '测试报告', value: 'test' },
      { label: '验收文档', value: 'acceptance' },
      { label: '其他', value: 'other' },
    ]},
    { name: 'tags', label: '标签', type: 'select' as const, placeholder: '请选择标签', options: [
      ...mockDocumentTags.map(t => ({ label: t.name, value: t.name })),
    ]},
  ];

  const columns: ColumnsType<Document> = [
    {
      title: '文档编号',
      dataIndex: 'code',
      key: 'code',
      width: 140,
    },
    {
      title: '文档名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
    },
    {
      title: '文档类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          requirement: '需求文档',
          design: '设计文档',
          manual: '操作手册',
          test: '测试报告',
          acceptance: '验收文档',
          other: '其他',
        };
        return typeMap[type] || type;
      },
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[]) => (
        <>
          {tags.map((tag, index) => (
            <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (size: number) => {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
      },
    },
    {
      title: '上传人',
      dataIndex: 'uploader',
      key: 'uploader',
      width: 120,
    },
    {
      title: '下载次数',
      dataIndex: 'downloadCount',
      key: 'downloadCount',
      width: 100,
    },
    {
      title: '上传时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 100,
      render: (time: string) => time?.split(' ')[0],
    },
  ];

  const handleDownload = async (record: Document) => {
    try {
      await downloadFile(record.fileUrl, record.name, (progress) => {
        console.log(`Download progress: ${progress.percent}%`);
      });

      // Update download count in store
      // In production, this would be updated via API
      message.success('下载成功');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '下载失败');
    }
  };

  const handlePreview = (record: Document) => {
    if (!canPreviewFile(record.fileType)) {
      message.info('该文件类型不支持预览，请下载后查看');
      return;
    }
    setPreviewDocument(record);
    setPreviewModalVisible(true);
  };

  const actions = [
    {
      label: '预览',
      onClick: (record: Document) => handlePreview(record),
      show: (record: Document) => canPreviewFile(record.fileType),
    },
    {
      label: '下载',
      onClick: (record: Document) => handleDownload(record),
    },
    {
      label: '编辑',
      onClick: (record: Document) => console.log('编辑文档', record),
    },
  ];

  const handleSearch = (values: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleReset = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleUploadChange = (info: any) => {
    const files = info.fileList.map((item: any) => item.originFileObj).filter(Boolean);
    setSelectedFiles(files);
    setUploadModalVisible(true);
  };

  const handleUploadComplete = (results: FileUploadItem[]) => {
    const successCount = results.filter(r => r.status === 'success').length;

    if (successCount > 0) {
      message.success(`成功上传 ${successCount} 个文件`);

      // In production, you would refresh the document list from the server
      // For now, we'll just show a success message
      console.log('Successfully uploaded files:', results.filter(r => r.status === 'success'));
    }

    const errorCount = results.filter(r => r.status === 'error').length;
    if (errorCount > 0) {
      message.warning(`${errorCount} 个文件上传失败`);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    showUploadList: false,
    onChange: handleUploadChange,
    beforeUpload: (file: File, fileList: File[]) => {
      // Validate files
      const validationResult = validateFile(file);
      if (!validationResult.valid) {
        message.error(validationResult.error);
        return Upload.LIST_IGNORE; // Skip this file
      }
      return false; // Prevent automatic upload
    },
  };

  return (
    <Card>
      <PageHeader
        title="项目文档"
        extra={
          <Space>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传文档</Button>
            </Upload>
            <Button icon={<FileOutlined />}>新建文件夹</Button>
          </Space>
        }
      />

      <FilterBar
        filters={filters}
        onSearch={handleSearch}
        onReset={handleReset}
        loading={loading}
      />

      <DataTable
        columns={columns}
        dataSource={documentsWithProjectName}
        actions={actions}
        loading={loading}
        rowKey="id"
      />

      <UploadProgressModal
        visible={uploadModalVisible}
        files={selectedFiles}
        onClose={() => setUploadModalVisible(false)}
        onComplete={handleUploadComplete}
      />

      <Modal
        title={previewDocument?.name}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            关闭
          </Button>,
          <Button
            key="download"
            type="primary"
            onClick={() => {
              if (previewDocument) {
                handleDownload(previewDocument);
              }
            }}
          >
            下载
          </Button>,
        ]}
        width="80%"
        style={{ top: 20 }}
      >
        {previewDocument && (
          <div style={{ minHeight: 500 }}>
            {canPreviewFile(previewDocument.fileType) ? (
              previewDocument.fileType === 'pdf' ? (
                <iframe
                  src={previewDocument.fileUrl}
                  style={{ width: '100%', height: '70vh', border: 'none' }}
                  title={previewDocument.name}
                />
              ) : ['png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp'].includes(previewDocument.fileType.toLowerCase()) ? (
                <img
                  src={previewDocument.fileUrl}
                  alt={previewDocument.name}
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                />
              ) : previewDocument.fileType === 'txt' ? (
                <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
                  <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                    {/* In production, load actual file content */}
                    文本文件预览功能（需要后端支持）
                  </pre>
                </div>
              ) : null
            ) : (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 48 }}>{getFileIcon(previewDocument.fileType)}</div>
                <p style={{ marginTop: 16, color: '#666' }}>
                  该文件类型不支持预览，请下载后查看
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default ProjectDoc;
