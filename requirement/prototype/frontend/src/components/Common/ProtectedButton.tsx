/**
 * Protected Button - Button with built-in permission checking
 */

import React from 'react';
import { Button, ButtonProps, Tooltip } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { Permission } from '../../types/permission';
import PermissionGate from './PermissionGate';

interface ProtectedButtonProps extends ButtonProps {
  permissions: Permission[];
  mode?: 'any' | 'all';
  tooltip?: string; // Tooltip to show when disabled
  requireAuth?: boolean;
}

/**
 * ProtectedButton - Button that is only enabled/visible when user has permissions
 *
 * @example
 * <ProtectedButton
 *   permissions={[Permission.PROJECT_EDIT]}
 *   onClick={handleEdit}
 * >
 *   Edit Project
 * </ProtectedButton>
 *
 * @example
 * <ProtectedButton
 *   permissions={[Permission.PROJECT_DELETE]}
 *   type="primary"
 *   danger
 *   tooltip="You don't have permission to delete projects"
 *   onClick={handleDelete}
 * >
 *   Delete
 * </ProtectedButton>
 */
const ProtectedButton: React.FC<ProtectedButtonProps> = ({
  permissions,
  mode = 'any',
  tooltip,
  children,
  requireAuth = true,
  disabled: propsDisabled,
  ...buttonProps
}) => {
  const button = (
    <PermissionGate
      permissions={permissions}
      mode={mode}
      requireAuth={requireAuth}
    >
      <Button {...buttonProps} disabled={propsDisabled}>
        {children}
      </Button>
    </PermissionGate>
  );

  // If tooltip is provided and user doesn't have permission, wrap in tooltip
  if (tooltip) {
    return (
      <PermissionGate
        permissions={permissions}
        mode={mode}
        requireAuth={requireAuth}
        fallback={
          <Tooltip title={tooltip}>
            <Button {...buttonProps} disabled icon={<LockOutlined />}>
              {children}
            </Button>
          </Tooltip>
        }
      >
        {button}
      </PermissionGate>
    );
  }

  return button;
};

export default ProtectedButton;
