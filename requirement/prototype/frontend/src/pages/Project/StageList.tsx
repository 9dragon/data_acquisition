import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Space, Modal, message } from 'antd';
import { PlusOutlined, ProjectOutlined } from '@ant-design/icons';
import { useStageStore } from '../../stores/stageStore';
import { mockStageDefinitions } from '../../services/mockData';
import StageFormModal from '../../components/Project/StageFormModal';
import StageCard from '../../components/Project/StageCard';
import { StageDefinition } from '../../types/project';

const StageList: React.FC = () => {
  const { stageDefinitions, setStageDefinitions, addStageDefinition, updateStageDefinition, deleteStageDefinition } = useStageStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStage, setEditingStage] = useState<StageDefinition | undefined>();

  // 初始化阶段数据
  useEffect(() => {
    if (stageDefinitions.length === 0) {
      setStageDefinitions(mockStageDefinitions);
    }
  }, []);

  const handleCreate = () => {
    setEditingStage(undefined);
    setModalVisible(true);
  };

  const handleEdit = (stage: StageDefinition) => {
    setEditingStage(stage);
    setModalVisible(true);
  };

  const handleDelete = (stage: StageDefinition) => {
    if (stage.isSystem) {
      message.warning('系统内置阶段不能删除');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除阶段"${stage.name}"吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteStageDefinition(stage.id);
        message.success('删除成功');
      },
    });
  };

  const handleModalOk = (values: Omit<StageDefinition, 'id' | 'createTime' | 'updateTime'>) => {
    if (editingStage) {
      updateStageDefinition(editingStage.id, values);
      message.success('更新成功');
    } else {
      addStageDefinition(values);
      message.success('创建成功');
    }
    setModalVisible(false);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  return (
    <div>
      <Card
        title={
          <Space>
            <ProjectOutlined />
            <span>项目阶段管理</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建阶段
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <div style={{ color: '#666', fontSize: 14 }}>
          管理项目实施阶段，可以创建自定义阶段或编辑系统内置阶段。
          每个阶段可以配置推进方式（按任务/按设备）和默认任务列表。
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {stageDefinitions.map((stage) => (
          <Col xs={24} sm={12} lg={6} key={stage.id}>
            <StageCard
              stage={stage}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Col>
        ))}
      </Row>

      <StageFormModal
        visible={modalVisible}
        editingStage={editingStage}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
      />
    </div>
  );
};

export default StageList;
