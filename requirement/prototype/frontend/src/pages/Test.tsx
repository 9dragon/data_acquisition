import React from 'react';
import { Card, Button, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const TestPage: React.FC = () => {
  return (
    <div style={{ padding: '50px' }}>
      <Card>
        <Title level={1}>测试页面</Title>
        <Paragraph>
          如果你看到这个页面，说明React和Ant Design都正常工作！
        </Paragraph>
        <Button type="primary">测试按钮</Button>
      </Card>
    </div>
  );
};

export default TestPage;
