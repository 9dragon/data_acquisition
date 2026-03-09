import React from 'react';
import { Breadcrumb, Button, Space, Typography } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  subTitle?: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  extra?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subTitle,
  breadcrumbs,
  extra,
  showBack = false,
  onBack,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumbs && (
        <Breadcrumb style={{ marginBottom: 8 }}>
          {breadcrumbs.map((crumb, index) => (
            <Breadcrumb.Item key={index}>
              {crumb.path ? (
                <a onClick={() => navigate(crumb.path!)}>{crumb.label}</a>
              ) : (
                crumb.label
              )}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          {showBack && (
            <Button
              key="back"
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              style={{ fontSize: '16px' }}
            />
          )}
          <div>
            <Title key="title" level={3} style={{ margin: 0 }}>
              {title}
            </Title>
            {subTitle && (
              <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                {subTitle}
              </div>
            )}
          </div>
        </Space>

        {extra && <div>{extra}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
