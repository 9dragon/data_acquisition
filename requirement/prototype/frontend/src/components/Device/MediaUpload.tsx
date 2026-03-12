import React, { useState } from 'react';
import { Upload, Modal, message, Progress, Tag } from 'antd';
import { PlusOutlined, PlayCircleOutlined, DeleteOutlined, FileOutlined, FilePdfOutlined, FileExcelOutlined, FileTextOutlined } from '@ant-design/icons';
import type { MediaAttachment } from '../../types/device';

// 文件类型定义（与MaterialFileType对应）
export type MediaAcceptType = 'image' | 'video' | 'document' | 'spreadsheet' | 'cad' | 'other' | 'both';

interface MediaUploadProps {
  value?: MediaAttachment[];
  onChange?: (files: MediaAttachment[]) => void;
  acceptType?: MediaAcceptType;
  maxCount?: number;
  disabled?: boolean;
  maxSize?: number; // MB
}

/**
 * 多媒体文件上传组件
 * 支持图片、视频、文档、表格、CAD图纸等多种文件类型
 */
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
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, number>>({});

  // 根据acceptType确定接受的文件类型
  const getAccept = (): string => {
    switch (acceptType) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'document':
        return '.pdf,.doc,.docx';
      case 'spreadsheet':
        return '.xls,.xlsx,.csv';
      case 'cad':
        return '.dwg,.dxf';
      case 'other':
        return '*/*';
      case 'both':
        return 'image/*,video/*';
      default:
        return '*/*';
    }
  };

  // 获取文件的MIME类型列表
  const getAcceptMimeTypes = (): string[] => {
    switch (acceptType) {
      case 'image':
        return ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
      case 'video':
        return ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
      case 'document':
        return ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      case 'spreadsheet':
        return ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
      case 'cad':
        return ['application/dwg', 'image/vnd.dxf', 'application/acad'];
      case 'other':
        return ['*/*'];
      case 'both':
        return ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];
      default:
        return ['*/*'];
    }
  };

  // 判断文件类型
  const getFileCategory = (fileName: string): 'image' | 'video' | 'document' | 'spreadsheet' | 'cad' | 'other' => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const videoExts = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
    const documentExts = ['pdf', 'doc', 'docx'];
    const spreadsheetExts = ['xls', 'xlsx', 'csv'];
    const cadExts = ['dwg', 'dxf'];

    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    if (documentExts.includes(ext)) return 'document';
    if (spreadsheetExts.includes(ext)) return 'spreadsheet';
    if (cadExts.includes(ext)) return 'cad';

    return 'other';
  };

  // 判断是否为图片
  const isImage = (type: string) => type === 'image';

  // 判断是否为视频
  const isVideo = (type: string) => type === 'video';

  // 判断是否为文档
  const isDocument = (type: string) => ['document', 'spreadsheet', 'cad'].includes(type);

  // 处理文件上传前的验证
  const beforeUpload = (file: File) => {
    const fileCategory = getFileCategory(file.name);
    const isAcceptable = checkFileType(fileCategory);

    if (!isAcceptable) {
      const typeNames: Record<MediaAcceptType, string> = {
        image: '图片',
        video: '视频',
        document: '文档',
        spreadsheet: '表格',
        cad: 'CAD图纸',
        other: '文件',
        both: '图片或视频',
      };
      message.error(`只能上传${typeNames[acceptType]}文件！`);
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

  // 检查文件类型是否可接受
  const checkFileType = (fileCategory: string): boolean => {
    if (acceptType === 'other' || acceptType === 'both') return true;
    if (acceptType === fileCategory) return true;

    // 对于both类型，接受图片和视频
    if (acceptType === 'both' && (fileCategory === 'image' || fileCategory === 'video')) {
      return true;
    }

    return false;
  };

  // 处理文件上传
  const handleUpload = (file: File) => {
    if (!beforeUpload(file)) {
      return false;
    }

    const fileId = `temp_${Date.now()}`;
    const fileUrl = URL.createObjectURL(file);
    const fileCategory = getFileCategory(file.name);

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
          type: fileCategory === 'image' ? 'image' : 'video', // 兼容旧类型
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
    const fileCategory = getFileCategory(file.name);

    if (fileCategory === 'image') {
      setPreviewImage(file.url);
      setPreviewTitle(file.name);
      setPreviewOpen(true);
    } else if (fileCategory === 'video') {
      setVideoPreviewUrl(file.url);
      setVideoPreviewOpen(true);
    } else {
      // 文档类文件，尝试在新窗口打开
      setDocumentPreviewUrl(file.url);
      setDocumentPreviewOpen(true);
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

  // 获取文件图标
  const getFileIcon = (fileName: string) => {
    const category = getFileCategory(fileName);

    switch (category) {
      case 'image':
        return null; // 使用缩略图
      case 'video':
        return <PlayCircleOutlined style={{ fontSize: 32, color: '#1890ff' }} />;
      case 'document':
        return <FilePdfOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />;
      case 'spreadsheet':
        return <FileExcelOutlined style={{ fontSize: 32, color: '#52c41a' }} />;
      case 'cad':
        return <FileOutlined style={{ fontSize: 32, color: '#722ed1' }} />;
      default:
        return <FileTextOutlined style={{ fontSize: 32, color: '#8c8c8c' }} />;
    }
  };

  // 获取文件类型标签
  const getFileTypeTag = (fileName: string) => {
    const category = getFileCategory(fileName);
    const ext = fileName.split('.').pop()?.toUpperCase() || '';

    const tagColors: Record<string, string> = {
      'PDF': '#ff4d4f',
      'DOC': '#1890ff',
      'DOCX': '#1890ff',
      'XLS': '#52c41a',
      'XLSX': '#52c41a',
      'CSV': '#52c41a',
      'DWG': '#722ed1',
      'DXF': '#722ed1',
    };

    return (
      <Tag color={tagColors[ext] || '#8c8c8c'} style={{ margin: 0, fontSize: 10 }}>
        {ext}
      </Tag>
    );
  };

  // 渲染文件项
  const renderUploadItem = (file: MediaAttachment) => {
    const isUploading = file.id.startsWith('temp_') && uploadingFiles[file.id] !== undefined;
    const uploadProgress = uploadingFiles[file.id] || 0;
    const fileCategory = getFileCategory(file.name);
    const isImageFile = fileCategory === 'image';

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
        {isImageFile ? (
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
              padding: 4,
            }}
            onClick={() => !disabled && handlePreview(file)}
          >
            {getFileIcon(file.name)}
            <div style={{ fontSize: 10, marginTop: 4, textAlign: 'center', wordBreak: 'break-all' }}>
              {file.name.slice(0, 12)}...
            </div>
            {getFileTypeTag(file.name)}
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

        {isImageFile && (
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
        )}
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

      {/* 文档预览提示 */}
      <Modal
        open={documentPreviewOpen}
        title="文档预览"
        footer={null}
        onCancel={() => setDocumentPreviewOpen(false)}
        width={600}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <FileOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <p>该文件类型不支持在线预览</p>
          <a href={documentPreviewUrl} download target="_blank" rel="noopener noreferrer">
            点击下载文件
          </a>
        </div>
      </Modal>
    </div>
  );
};

export default MediaUpload;
