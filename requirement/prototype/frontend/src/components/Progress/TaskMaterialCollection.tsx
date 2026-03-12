import React, { useEffect } from 'react';
import { Card, Typography, Tag, Space, Collapse, Alert, Divider } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, FileOutlined } from '@ant-design/icons';
import { MaterialRequirement, TaskMaterial, MaterialFileType } from '../../types/project';
import { MediaAttachment } from '../../types/device';
import { validateMaterialRequirement, getFileTypeName, getAcceptTypes } from '../../utils/progressCalculators';
import MediaUpload from '../Device/MediaUpload';

const { Text, Title } = Typography;
const { Panel } = Collapse;

interface TaskMaterialCollectionProps {
  taskName: string;
  materialRequirements: MaterialRequirement[];
  materials: TaskMaterial[];
  onChange: (materials: TaskMaterial[]) => void;
  disabled?: boolean;
}

/**
 * 任务资料收集组件
 * 展示任务需要收集的所有资料类型，支持文件上传和验证
 */
const TaskMaterialCollection: React.FC<TaskMaterialCollectionProps> = ({
  taskName,
  materialRequirements,
  materials,
  onChange,
  disabled = false,
}) => {
  // 当资料需求变化时，自动初始化缺失的资料项
  useEffect(() => {
    const existingKeys = materials.map(m => m.requirementKey);
    const missingRequirements = materialRequirements.filter(req => !existingKeys.includes(req.key));

    if (missingRequirements.length > 0) {
      const newMaterials = [
        ...materials,
        ...missingRequirements.map(req => ({
          requirementKey: req.key,
          requirementName: req.name,
          files: [] as MediaAttachment[],
          completed: false,
        })),
      ];
      onChange(newMaterials);
    }
  }, [materialRequirements, materials, onChange]);

  // 处理文件变化
  const handleFileChange = (requirementKey: string, files: MediaAttachment[]) => {
    const updatedMaterials = materials.map(material => {
      if (material.requirementKey === requirementKey) {
        const requirement = materialRequirements.find(req => req.key === requirementKey);
        const completed = requirement ? validateMaterialRequirement(requirement, files) : false;

        return {
          ...material,
          files,
          completed,
          completedDate: completed && !material.completedDate ? new Date().toISOString().split('T')[0] : material.completedDate,
        };
      }
      return material;
    });
    onChange(updatedMaterials);
  };

  // 获取资料需求的状态
  const getRequirementStatus = (requirement: MaterialRequirement, material: TaskMaterial) => {
    const isValid = validateMaterialRequirement(requirement, material.files);
    const fileCount = material.files.length;

    if (isValid) {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          已完成
        </Tag>
      );
    }

    if (requirement.required && fileCount === 0) {
      return (
        <Tag icon={<ExclamationCircleOutlined />} color="error">
          必填
        </Tag>
      );
    }

    const minCount = requirement.minCount || 0;
    if (fileCount < minCount) {
      return (
        <Tag color="warning">
          至少需要 {minCount} 个文件
        </Tag>
      );
    }

    return (
      <Tag color="default">
        未完成
      </Tag>
    );
  };

  // 获取数量要求文本
  const getCountRequirementText = (requirement: MaterialRequirement): string => {
    if (requirement.minCount !== undefined && requirement.maxCount !== undefined) {
      if (requirement.minCount === requirement.maxCount) {
        return `需上传 ${requirement.minCount} 个`;
      }
      return `需上传 ${requirement.minCount}-${requirement.maxCount} 个`;
    }
    if (requirement.minCount !== undefined) {
      return `至少 ${requirement.minCount} 个`;
    }
    if (requirement.maxCount !== undefined) {
      return `最多 ${requirement.maxCount} 个`;
    }
    return requirement.required ? '必填' : '选填';
  };

  // 过滤出有效的资料需求
  const validMaterials = materials.filter(m =>
    materialRequirements.some(req => req.key === m.requirementKey)
  );

  // 计算整体完成状态
  const allCompleted = materialRequirements.every(req => {
    const material = materials.find(m => m.requirementKey === req.key);
    if (!material) return !req.required;
    return validateMaterialRequirement(req, material.files);
  });

  const completedCount = materialRequirements.filter(req => {
    const material = materials.find(m => m.requirementKey === req.key);
    if (!material) return !req.required;
    return validateMaterialRequirement(req, material.files);
  }).length;

  if (materialRequirements.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: 12 }}>
      <Card
        size="small"
        title={
          <Space>
            <FileOutlined />
            <Text strong>资料收集</Text>
            <Tag color={allCompleted ? 'success' : 'processing'}>
              {completedCount} / {materialRequirements.length}
            </Tag>
          </Space>
        }
        style={{ backgroundColor: '#fafafa' }}
      >
        {!allCompleted && (
          <Alert
            message="资料收集未完成"
            description={`还有 ${materialRequirements.length - completedCount} 项资料需要完成`}
            type="warning"
            showIcon
            closable
            style={{ marginBottom: 12 }}
          />
        )}

        <Collapse
          defaultActiveKey={allCompleted ? [] : ['0']}
          expandIconPosition="end"
          size="small"
        >
          {validMaterials.map((material, index) => {
            const requirement = materialRequirements.find(req => req.key === material.requirementKey);
            if (!requirement) return null;

            return (
              <Panel
                key={material.requirementKey}
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                    <Space>
                      <Text strong>{requirement.name}</Text>
                      <Tag color="blue" style={{ margin: 0 }}>
                        {getFileTypeName(requirement.fileType)}
                      </Tag>
                    </Space>
                    <Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {getCountRequirementText(requirement)}
                      </Text>
                      {getRequirementStatus(requirement, material)}
                    </Space>
                  </div>
                }
                style={{
                  backgroundColor: material.completed ? '#f6ffed' : undefined,
                  marginBottom: 4,
                }}
              >
                <div style={{ padding: '8px 0' }}>
                  {requirement.description && (
                    <div style={{ marginBottom: 12 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {requirement.description}
                      </Text>
                    </div>
                  )}

                  <div>
                    <Text strong style={{ fontSize: 12 }}>
                      已上传 {material.files.length} 个文件
                    </Text>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <MediaUpload
                      value={material.files}
                      onChange={(files) => handleFileChange(material.requirementKey, files)}
                      acceptType={requirement.fileType === MaterialFileType.IMAGE ? 'image' : 'both'}
                      maxCount={requirement.maxCount || 10}
                      disabled={disabled}
                    />
                  </div>

                  {requirement.minCount !== undefined && material.files.length < requirement.minCount && (
                    <div style={{ marginTop: 8, color: '#ff4d4f', fontSize: 12 }}>
                      至少需要上传 {requirement.minCount} 个文件，当前已上传 {material.files.length} 个
                    </div>
                  )}
                </div>
              </Panel>
            );
          })}
        </Collapse>
      </Card>
    </div>
  );
};

export default TaskMaterialCollection;
