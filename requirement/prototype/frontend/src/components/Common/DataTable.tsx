import React from 'react';
import { Table, Space, Button, Tag } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';

export interface ActionItem {
  label?: string;  // 改为可选
  onClick?: (record: any) => void;  // 改为可选
  danger?: boolean;
  disabled?: boolean | ((record: any) => boolean);
  render?: (record: any) => React.ReactNode;  // 新增
}

interface DataTableProps<T> extends Omit<TableProps<T>, 'columns'> {
  columns: ColumnsType<T>;
  actions?: ActionItem[];
  rowKey?: string;
}

function DataTable<T extends Record<string, any>>({
  columns,
  actions,
  rowKey = 'id',
  ...props
}: DataTableProps<T>) {
  const actionColumn: ColumnsType<T> = actions
    ? [
        {
          title: '操作',
          key: 'action',
          width: 165,
          render: (_: any, record: T) => (
            <Space size="small">
              {actions.map((action, index) => {
                // 如果有 render 函数，直接使用
                if (action.render) {
                  return <React.Fragment key={index}>{action.render(record)}</React.Fragment>;
                }

                // 否则使用原有的 Button 渲染逻辑
                const isDisabled = typeof action.disabled === 'function'
                  ? action.disabled(record)
                  : action.disabled;

                return (
                  <Button
                    key={index}
                    type="link"
                    size="small"
                    danger={action.danger}
                    disabled={isDisabled}
                    onClick={() => action.onClick!(record)}
                  >
                    {action.label}
                  </Button>
                );
              })}
            </Space>
          ),
        },
      ]
    : [];

  // 计算所有列的总宽度
  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 100), 0) + (actions ? 165 : 0);

  return (
    <Table<T>
      columns={[...columns, ...actionColumn]}
      rowKey={rowKey}
      scroll={{ x: totalWidth }}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
        defaultPageSize: 10,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      {...props}
    />
  );
}

export default DataTable;
