import React from 'react';

const MinimalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: '#f0f2f5',
      padding: '20px'
    }
  }, children);
};

export default MinimalLayout;
