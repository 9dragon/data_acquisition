import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{ padding: '50px', background: '#f0f0f0' }}>
      <h1 style={{ color: 'red' }}>测试页面 - 如果你看到这个，说明React正常工作</h1>
      <p>当前时间: {new Date().toLocaleString()}</p>
      <button onClick={() => alert('点击成功!')}>测试按钮</button>
    </div>
  );
};

export default App;
