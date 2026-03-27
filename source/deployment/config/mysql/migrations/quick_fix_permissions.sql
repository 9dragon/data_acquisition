-- =============================================
-- 快速修复：添加角色权限相关表和字段
-- 请使用Navicat或phpMyAdmin执行此脚本
-- =============================================

USE data_acquisition;

-- 1. 添加 t_role 表的 permissions 字段（如果不存在）
ALTER TABLE t_role
ADD COLUMN IF NOT EXISTS permissions VARCHAR(1000) DEFAULT NULL COMMENT '权限ID列表，逗号分隔' AFTER description;

-- 2. 添加 t_role 表的 is_system 字段（如果不存在）
ALTER TABLE t_role
ADD COLUMN IF NOT EXISTS is_system INT DEFAULT 0 COMMENT '是否系统预置：0=否, 1=是' AFTER permissions;

-- 3. 创建权限表
CREATE TABLE IF NOT EXISTS t_permission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '权限ID',
    code VARCHAR(100) NOT NULL UNIQUE COMMENT '权限编码',
    name VARCHAR(100) NOT NULL COMMENT '权限名称',
    type ENUM('menu', 'button', 'api') NOT NULL DEFAULT 'button' COMMENT '权限类型',
    parent_id BIGINT DEFAULT NULL COMMENT '父权限ID',
    path VARCHAR(200) DEFAULT NULL COMMENT '前端路由路径',
    method VARCHAR(10) DEFAULT NULL COMMENT 'HTTP方法',
    description VARCHAR(500) DEFAULT NULL COMMENT '权限描述',
    sort_order INT DEFAULT 0 COMMENT '排序序号',
    status TINYINT DEFAULT 1 COMMENT '状态',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    created_by BIGINT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT DEFAULT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_parent_id (parent_id),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 4. 插入预置权限
-- 先插入父级权限
INSERT INTO t_permission (code, name, type, parent_id, sort_order, description) VALUES
('project', '项目管理', 'menu', NULL, 1, '项目管理模块'),
('device', '设备管理', 'menu', NULL, 2, '设备管理模块'),
('system', '系统管理', 'menu', NULL, 3, '系统管理模块')
ON DUPLICATE KEY UPDATE code=code;

-- 获取父级权限ID并插入子权限
SET @project_id = (SELECT id FROM t_permission WHERE code='project');
INSERT INTO t_permission (code, name, type, parent_id, sort_order, description) VALUES
('project:view', '查看项目', 'button', @project_id, 1, '查看项目列表'),
('project:create', '创建项目', 'button', @project_id, 2, '创建新项目'),
('project:edit', '编辑项目', 'button', @project_id, 3, '编辑项目信息'),
('project:delete', '删除项目', 'button', @project_id, 4, '删除项目'),
('project:assign', '分配成员', 'button', @project_id, 5, '分配项目成员')
ON DUPLICATE KEY UPDATE code=code;

SET @device_id = (SELECT id FROM t_permission WHERE code='device');
INSERT INTO t_permission (code, name, type, parent_id, sort_order, description) VALUES
('device:view', '查看设备', 'button', @device_id, 1, '查看设备列表'),
('device:create', '创建设备', 'button', @device_id, 2, '创建新设备'),
('device:edit', '编辑设备', 'button', @device_id, 3, '编辑设备信息'),
('device:delete', '删除设备', 'button', @device_id, 4, '删除设备')
ON DUPLICATE KEY UPDATE code=code;

SET @system_id = (SELECT id FROM t_permission WHERE code='system');
INSERT INTO t_permission (code, name, type, parent_id, sort_order, description) VALUES
('role:view', '查看角色', 'button', @system_id, 1, '查看角色列表'),
('role:create', '创建角色', 'button', @system_id, 2, '创建新角色'),
('role:edit', '编辑角色', 'button', @system_id, 3, '编辑角色信息'),
('role:delete', '删除角色', 'button', @system_id, 4, '删除角色'),
('stage:manage', '阶段配置', 'button', @system_id, 5, '配置项目阶段'),
('process:manage', '工序管理', 'button', @system_id, 6, '管理工序'),
('user:view', '查看用户', 'button', @system_id, 7, '查看用户列表'),
('user:create', '创建用户', 'button', @system_id, 8, '创建新用户'),
('user:edit', '编辑用户', 'button', @system_id, 9, '编辑用户信息'),
('user:delete', '删除用户', 'button', @system_id, 10, '删除用户')
ON DUPLICATE KEY UPDATE code=code;

-- 5. 为ADMIN角色分配所有权限
UPDATE t_role
SET permissions = (SELECT GROUP_CONCAT(id ORDER BY sort_order SEPARATOR ',')
                  FROM t_permission
                  WHERE deleted = 0)
WHERE code = 'ADMIN';

-- 验证结果
SELECT '✅ 数据库修复完成！' AS message;
SELECT CONCAT('权限数量: ', COUNT(*)) AS result FROM t_permission WHERE deleted = 0;
SELECT code, name, is_system,
       CASE WHEN permissions IS NOT NULL THEN LENGTH(permissions) - LENGTH(REPLACE(permissions, ',', '')) + 1 ELSE 0 END AS permission_count
FROM t_role
WHERE code = 'ADMIN';
