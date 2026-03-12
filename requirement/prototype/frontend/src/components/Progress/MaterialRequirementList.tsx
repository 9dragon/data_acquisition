import React from 'react';
import { List, Typography, Tag, Space, Button, Upload, Progress, Modal, message } from 'antd';
import { FileOutlined, CheckCircleOutlined, ExclamationCircleOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { MaterialRequirement, TaskMaterial } from '../../types/project';
import { MediaAttachment } from '../../types/device';
import { validateMaterialRequirement, getFileTypeName } from '../../utils/progressCalculators';

const { Text } = Typography;

interface MaterialRequirementListProps {
  requirements: MaterialRequirement[];
  materials: TaskMaterial[];
  onMaterialChange: (requirementKey: string, files: MediaAttachment[]) => void;
  disabled?: boolean;
  compact?: boolean;  // 紧凑模式
}

/**
 * 资料需求展示组件
 * 以紧凑列表形式展示资料需求，支持快速上传和预览
 */
const MaterialRequirementList: React.FC<MaterialRequirementListProps> = ({
  requirements,
  materials,
  onMaterialChange,
  disabled = false,
  compact = false,
}) => {
  // 处理文件上传
  const handleFileUpload = (requirementKey: string, file: File) => {
    const requirement = requirements.find(req => req.key === requirementKey);
    const material = materials.find(m => m.requirementKey === requirementKey);
    if (!requirement || !material) return;

    const currentCount = material.files.length;
    if (requirement.maxCount && currentCount >= requirement.maxCount) {
      message.error(`最多只能上传 ${requirement.maxCount} 个文件`);
      return false;
    }

    // 创建附件对象
    const newAttachment: MediaAttachment = {
      id: `temp_${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: requirement.fileType === 'image' ? 'image' : 'video',
      size: file.size,
      uploadTime: new Date().toISOString(),
    };

    const updatedFiles = [...material.files, newAttachment];
    onMaterialChange(requirementKey, updatedFiles);
    message.success(`${file.name} 上传成功`);

    return false; // 阻止自动上传
  };

  // 获取资料状态
  const getRequirementStatus = (requirement: MaterialRequirement, material: TaskMaterial) => {
    const isValid = validateMaterialRequirement(requirement, material.files);
    const fileCount = material.files.length;

    if (isValid) {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success" style={{ margin: 0 }}>
          已完成
        </Tag>
      );
    }

    if (requirement.required && fileCount === 0) {
      return (
        <Tag icon={<ExclamationCircleOutlined />} color="error" style={{ margin: 0 }}>
          必填
        </Tag>
      );
    }

    return (
      <Tag color="default" style={{ margin: 0 }}>
        {fileCount} / {requirement.minCount || '?'} 个
      </Tag>
    );
  };

  // 预览文件
  const handlePreview = (file: MediaAttachment) => {
    Modal.info({
      title: file.name,
      width: 600,
      content: (
        <div>
          {file.type === 'image' ? (
            <img src={file.url} alt={file.name} style={{ maxWidth: '100%' }} />
          ) : (
            <video src={file.url} controls style={{ maxWidth: '100%' }} />
          )}
          <div style={{ marginTop: 12 }}>
            <Text type="secondary">文件大小: {(file.size || 0) / 1024 / 1024} MB</Text>
          </div>
        </div>
      ),
    });
  };

  // 删除文件
  const handleRemoveFile = (requirementKey: string, fileId: string) => {
    const material = materials.find(m => m.requirementKey === requirementKey);
    if (!material) return;

    const updatedFiles = material.files.filter(f => f.id !== fileId);
    onMaterialChange(requirementKey, updatedFiles);
  };

  // 获取数量要求文本
  const getCountText = (requirement: MaterialRequirement, fileCount: number): string => {
    if (requirement.minCount !== undefined && requirement.maxCount !== undefined) {
      return `${fileCount}/${requirement.minCount}-${requirement.maxCount}`;
    }
    if (requirement.minCount !== undefined) {
      return `${fileCount}/${requirement.minCount}+`;
    }
    return `${fileCount}`;
  };

  if (requirements.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
        暂无资料要求
      </div>
    );
  }

  return (
    <List
      size={compact ? 'small' : 'default'}
      dataSource={requirements}
      renderItem={(requirement) => {
        const material = materials.find(m => m.requirementKey === requirement.key);
        const fileCount = material?.files.length || 0;

        return (
          <List.Item
            key={requirement.key}
            style={{
              backgroundColor: material?.completed ? '#f6ffed' : undefined,
              padding: compact ? '8px 12px' : undefined,
            }}
            actions={[
              !disabled && (
                <Upload
                  key="upload"
                  accept={requirement.fileType === 'image' ? 'image/*' : '*'}
                  showUploadList={false}
                  beforeUpload={(file) => handleFileUpload(requirement.key, file)}
                  disabled={disabled || (requirement.maxCount !== undefined && fileCount >= requirement.maxCount)}
                >
                  <Button
                    type="link"
                    size="small"
                    icon={<UploadOutlined />}
                    disabled={disabled || (requirement.maxCount !== undefined && fileCount >= requirement.maxCount)}
                  >
                    上传
                  </Button>
                </Upload>
              ),
            ]}
          >
            <List.Item.Meta
              avatar={<FileOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
              title={
                <Space>
                  <Text strong>{requirement.name}</Text>
                  <Tag color="blue" style={{ fontSize: 11 }}>
                    {getFileTypeName(requirement.fileType)}
                  </Tag>
                  {getRequirementStatus(requirement, material || { requirementKey: requirement.key, requirementName: requirement.name, files: [], completed: false })}
                </Space>
              }
              description={
                <div>
                  <Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {getCountText(requirement, fileCount)} 个文件
                    </Text>
                    {requirement.description && (
                      <>
                        <span style={{ color: '#d9d9d9' }}>|</span>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {requirement.description}
                        </Text>
                      </>
                    )}
                  </Space>

                  {/* 已上传文件快速预览 */}
                  {material && material.files.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <Space wrap size={4}>
                        {material.files.map(file => (
                          <div
                            key={file.id}
                            style={{
                              position: 'relative',
                              width: 40,
                              height: 40,
                              border: '1px solid #d9d9d9',
                              borderRadius: 4,
                              overflow: 'hidden',
                              cursor: 'pointer',
                            }}
                            onClick={() => handlePreview(file)}
                          >
                            {file.type === 'image' ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#fafafa',
                                fontSize: 10,
                              }}>
                                视频
                              </div>
                            )}
                            {!disabled && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  right: 0,
                                  background: 'rgba(255,77,79,0.8)',
                                  color: '#fff',
                                  width: 14,
                                  height: 14,
                                  fontSize: 10,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFile(requirement.key, file.id);
                                }}
                              >
                                ×
                              </div>
                            )}
                          </div>
                        ))}
                      </Space>
                    </div>
                  )}
                </div>
              }
            />
          </List.Item>
        );
      }}
    />
  );
};

export default MaterialRequirementList;
