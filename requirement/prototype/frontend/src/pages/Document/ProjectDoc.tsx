import React, { useState } from 'react';
import { Card, Space, Button, Tag, Upload } from 'antd';
import { UploadOutlined, FileOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import FilterBar from '../../components/Common/FilterBar';
import DataTable from '../../components/Common/DataTable';
import StatusTag from '../../components/Common/StatusTag';
import { useDocumentStore } from '../../stores/documentStore';
import { mockDocuments, mockProjects, mockDocumentTags } from '../../services/mockData';
import type { ColumnsType } from 'antd/es/table';
import type { Document } from '../../types/document';

const ProjectDoc: React.FC = () => {
  const navigate = useNavigate();
  const { documents } = useDocumentStore();
  const [loading, setLoading] = useState(false);

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

  const actions = [
    {
      label: '下载',
      onClick: (record: Document) => console.log('下载文档', record),
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

  const uploadProps = {
    name: 'file',
    multiple: true,
    showUploadList: false,
    beforeUpload: (file: any) => {
      console.log('上传文件:', file);
      return false;
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
    </Card>
  );
};

export default ProjectDoc;
