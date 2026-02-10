import React, { useEffect, useState } from 'react';
import { Row, Col, Card, List, Badge, Tag, Space } from 'antd';
import { ClockCircleOutlined, BugOutlined, FileTextOutlined, BellOutlined, ProjectOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../stores/projectStore';
import { useIssueStore } from '../../stores/issueStore';
import { useDocumentStore } from '../../stores/documentStore';
import { mockProjects, mockIssues, mockDocuments } from '../../services/mockData';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { projects, setProjects, stats } = useProjectStore();
  const { issues, setIssues } = useIssueStore();
  const { documents, setDocuments } = useDocumentStore();

  useEffect(() => {
    // 初始化数据
    setProjects(mockProjects);
    setIssues(mockIssues);
    setDocuments(mockDocuments);
  }, []);

  // 待办事项数据
  const todoItems = [
    {
      id: '1',
      title: '注塑机02部分点位需要重新配置',
      type: 'device',
      priority: 'high',
      deviceName: '注塑机-02',
      projectId: '1',
    },
    {
      id: '2',
      title: 'CNC设备测试报告需要审阅',
      type: 'document',
      priority: 'medium',
      documentName: 'CNC设备测试报告',
      projectId: '4',
    },
    {
      id: '3',
      title: '装配机器人OPC UA连接不稳定',
      type: 'issue',
      priority: 'high',
      issueTitle: '装配机器人OPC UA连接不稳定',
      projectId: '1',
    },
  ];

  // 我的项目
  const myProjects = projects.filter(p =>
    p.managerId === '1' || p.teamMembers.includes('1')
  ).slice(0, 5);

  // 进度预警
  const warnings = [
    {
      id: '1',
      type: 'delay',
      title: '装配线数字化改造延期风险',
      project: '装配线数字化改造',
      reason: '设备到货延迟，影响现场调试进度',
    },
    {
      id: '2',
      type: 'abnormal',
      title: '注塑机02采集异常',
      project: '智能制造车间数采项目',
      reason: '部分点位数据读取失败',
    },
  ];

  // 通知公告
  const notifications = [
    {
      id: '1',
      title: '关于系统维护的通知',
      content: '系统将于本周六晚上22:00进行维护，预计2小时',
      time: '2024-02-04 10:00',
      type: 'info',
    },
    {
      id: '2',
      title: '数采项目进度汇报会议',
      content: '请各项目负责人准备进度汇报材料',
      time: '2024-02-03 14:00',
      type: 'warning',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* 待办事项 */}
        <Col key="todo" span={8}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                待办事项
              </Space>
            }
            extra={<Badge count={todoItems.length} />}
          >
            <List
              dataSource={todoItems}
              renderItem={(item) => (
                <List.Item
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (item.type === 'device') {
                      navigate(`/device/${item.id}`);
                    } else if (item.type === 'issue') {
                      navigate(`/issue/${item.id}`);
                    } else if (item.type === 'document') {
                      navigate('/document');
                    }
                  }}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        {item.type === 'device' && <Tag key="device" color="blue">设备</Tag>}
                        {item.type === 'issue' && <Tag key="issue" color="red">问题</Tag>}
                        {item.type === 'document' && <Tag key="document" color="green">文档</Tag>}
                        <span key="title">{item.title}</span>
                      </Space>
                    }
                    description={
                      <Tag color={getPriorityColor(item.priority)}>
                        {item.priority === 'high' ? '高优先级' : item.priority === 'medium' ? '中优先级' : '低优先级'}
                      </Tag>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 我的项目 */}
        <Col key="projects" span={8}>
          <Card
            title={
              <Space>
                <ProjectOutlined />
                我的项目
              </Space>
            }
            extra={<a onClick={() => navigate('/project')}>查看全部</a>}
          >
            <List
              dataSource={myProjects}
              renderItem={(project) => (
                <List.Item
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <List.Item.Meta
                    title={project.name}
                    description={
                      <Space>
                        <span key="code">{project.code}</span>
                        <span key="dot">·</span>
                        <span key="progress">进度: {project.progress}%</span>
                      </Space>
                    }
                  />
                  <div>
                    <Badge
                      status={project.status === 'in_progress' ? 'processing' : 'default'}
                      text={
                        project.stage === 'presale' ? '售前调研' :
                        project.stage === 'planning' ? '准备阶段' :
                        project.stage === 'construction' ? '施工阶段' :
                        project.stage === 'configuration' ? '配置阶段' :
                        project.stage === 'verification' ? '核对阶段' :
                        project.stage === 'acceptance' ? '验收阶段' :
                        '已完成'
                      }
                    />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 进度预警 */}
        <Col key="warnings" span={8}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#ff4d4f' }} />
                进度预警
              </Space>
            }
            extra={<Badge count={warnings.length} />}
          >
            <List
              dataSource={warnings}
              renderItem={(warning) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag key="tag" color={warning.type === 'delay' ? 'orange' : 'red'}>
                          {warning.type === 'delay' ? '延期' : '异常'}
                        </Tag>
                        <span key="title">{warning.title}</span>
                      </Space>
                    }
                    description={
                      <div>
                        <div>{warning.project}</div>
                        <div style={{ color: '#999', fontSize: '12px' }}>{warning.reason}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 通知公告 */}
        <Col key="notifications" span={24}>
          <Card
            title={
              <Space>
                <BellOutlined />
                通知公告
              </Space>
            }
          >
            <List
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag key="tag" color={item.type === 'warning' ? 'warning' : 'blue'}>
                          {item.type === 'warning' ? '重要' : '通知'}
                        </Tag>
                        <span key="title">{item.title}</span>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <span>{item.content}</span>
                        <span style={{ color: '#999', fontSize: '12px' }}>{item.time}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
