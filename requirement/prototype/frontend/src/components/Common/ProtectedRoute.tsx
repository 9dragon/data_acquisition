/**
 * Protected Route component for route-level permission checking
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Result, Button } from 'antd';
import { Permission } from '../../types/permission';
import { usePermissions } from '../../stores/permissionStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requireAuth = true,
  fallback,
}) => {
  const location = useLocation();
  const { user, hasAnyPermission, isAdmin } = usePermissions();

  // Check if user is authenticated
  if (requireAuth && !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Check permissions if specified
  if (requiredPermissions.length > 0 && !isAdmin) {
    const hasAccess = hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      // Show custom fallback if provided
      if (fallback) {
        return <>{fallback}</>;
      }

      // Show access denied result
      return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <Result
            status="403"
            title="403"
            subTitle="抱歉，您没有权限访问此页面"
            extra={
              <Button type="primary" onClick={() => window.history.back()}>
                返回上一页
              </Button>
            }
          />
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
