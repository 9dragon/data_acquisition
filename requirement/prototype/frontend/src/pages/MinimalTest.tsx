import React from 'react';

const MinimalTest: React.FC = () => {
  const handleClick = () => {
    alert('React is working!');
  };

  return React.createElement('div',
    { style: { padding: '50px', fontSize: '24px', color: 'blue' } },
    React.createElement('h1', null, 'Minimal Test'),
    React.createElement('p', null, '如果你能看到这段文字，React正常工作！'),
    React.createElement('button',
      { onClick: handleClick, style: { padding: '10px 20px', fontSize: '16px' } },
      '点击测试'
    )
  );
};

export default MinimalTest;
