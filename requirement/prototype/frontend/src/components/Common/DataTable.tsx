import React from 'react';
import { Table, Space, Button, Tag } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';

export interface ActionItem {
  label: string;
  onClick: (record: any) => void;
  danger?: boolean;
  disabled?: boolean | ((record: any) => boolean);
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
          fixed: 'right',
          width: 200,
          render: (_: any, record: T) => (
            <Space size="small">
              {actions.map((action, index) => {
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
                    onClick={() => action.onClick(record)}
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

  return (
    <Table<T>
      columns={[...columns, ...actionColumn]}
      rowKey={rowKey}
      scroll={{ x: 1200 }}
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
