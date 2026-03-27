-- =============================================
-- P0第一批完整数据库迁移脚本
-- 版本: V1.0
-- 日期: 2026-03-26
-- 说明: 此脚本合并了02和03号迁移脚本
-- =============================================

USE data_acquisition;

-- =============================================
-- 第一部分：角色权限模块迁移
-- =============================================

-- 1. 创建权限表
CREATE TABLE IF NOT EXISTS t_permission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '权限ID',
    code VARCHAR(100) NOT NULL UNIQUE COMMENT '权限编码，如：project:create',
    name VARCHAR(100) NOT NULL COMMENT '权限名称',
    type ENUM('menu', 'button', 'api') NOT NULL DEFAULT 'button' COMMENT '权限类型',
    parent_id BIGINT DEFAULT NULL COMMENT '父权限ID',
    path VARCHAR(200) DEFAULT NULL COMMENT '前端路由路径',
    method VARCHAR(10) DEFAULT NULL COMMENT 'HTTP方法：GET/POST/PUT/DELETE',
    description VARCHAR(500) DEFAULT NULL COMMENT '权限描述',
    sort_order INT DEFAULT 0 COMMENT '排序序号',
    status TINYINT DEFAULT 1 COMMENT '状态：1启用 0禁用',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    created_by BIGINT DEFAULT NULL COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_by BIGINT DEFAULT NULL COMMENT '更新人',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_code (code),
    INDEX idx_parent_id (parent_id),
    INDEX idx_type (type),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 2. 插入预置权限
INSERT INTO t_permission (code, name, type, parent_id, sort_order, description) VALUES
-- 项目管理模块
('project', '项目管理', 'menu', NULL, 1, '项目管理模块'),
('project:view', '查看项目', 'button', LAST_INSERT_ID(), 1, '查看项目列表'),
('project:create', '创建项目', 'button', LAST_INSERT_ID(), 2, '创建新项目'),
('project:edit', '编辑项目', 'button', LAST_INSERT_ID(), 3, '编辑项目信息'),
('project:delete', '删除项目', 'button', LAST_INSERT_ID(), 4, '删除项目'),
('project:assign', '分配成员', 'button', LAST_INSERT_ID(), 5, '分配项目成员'),

-- 设备管理模块
('device', '设备管理', 'menu', NULL, 2, '设备管理模块'),
('device:view', '查看设备', 'button', LAST_INSERT_ID(), 1, '查看设备列表'),
('device:create', '创建设备', 'button', LAST_INSERT_ID(), 2, '创建新设备'),
('device:edit', '编辑设备', 'button', LAST_INSERT_ID(), 3, '编辑设备信息'),
('device:delete', '删除设备', 'button', LAST_INSERT_ID(), 4, '删除设备'),

-- 系统管理模块
('system', '系统管理', 'menu', NULL, 3, '系统管理模块'),
('role:view', '查看角色', 'button', LAST_INSERT_ID(), 1, '查看角色列表'),
('role:create', '创建角色', 'button', LAST_INSERT_ID(), 2, '创建新角色'),
('role:edit', '编辑角色', 'button', LAST_INSERT_ID(), 3, '编辑角色信息'),
('role:delete', '删除角色', 'button', LAST_INSERT_ID(), 4, '删除角色'),
('stage:manage', '阶段配置', 'button', LAST_INSERT_ID(), 5, '配置项目阶段'),
('process:manage', '工序管理', 'button', LAST_INSERT_ID(), 6, '管理工序'),
('user:view', '查看用户', 'button', LAST_INSERT_ID(), 7, '查看用户列表'),
('user:create', '创建用户', 'button', LAST_INSERT_ID(), 8, '创建新用户'),
('user:edit', '编辑用户', 'button', LAST_INSERT_ID(), 9, '编辑用户信息'),
('user:delete', '删除用户', 'button', LAST_INSERT_ID(), 10, '删除用户')
ON DUPLICATE KEY UPDATE code=code;

-- 3. 更新t_role表，添加is_system字段（如果不存在）
ALTER TABLE t_role
ADD COLUMN IF NOT EXISTS is_system INT DEFAULT 0 COMMENT '是否系统预置角色：0=否, 1=是' AFTER description;

-- 4. 为超级管理员角色分配所有权限
UPDATE t_role
SET permissions = (SELECT GROUP_CONCAT(id ORDER BY sort_order SEPARATOR ',')
                  FROM t_permission
                  WHERE deleted = 0)
WHERE code = 'ADMIN';

SELECT '✅ 角色权限模块数据库迁移完成！' AS message;
SELECT COUNT(*) AS permission_count FROM t_permission WHERE deleted = 0;

-- =============================================
-- 第二部分：项目阶段模块迁移
-- =============================================

-- 1. 创建项目阶段表
CREATE TABLE IF NOT EXISTS t_stage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '阶段ID',
    `key` VARCHAR(50) NOT NULL UNIQUE COMMENT '阶段唯一标识',
    name VARCHAR(100) NOT NULL COMMENT '阶段名称',
    description VARCHAR(500) DEFAULT NULL COMMENT '阶段描述',
    icon VARCHAR(50) DEFAULT NULL COMMENT '图标',
    color VARCHAR(20) DEFAULT NULL COMMENT '显示颜色',
    progress_mode ENUM('by_task', 'by_device') NOT NULL DEFAULT 'by_device' COMMENT '推进方式',
    is_system INT DEFAULT 0 COMMENT '是否系统预置',
    default_weight INT DEFAULT 0 COMMENT '默认权重 0-100',
    task_templates JSON DEFAULT NULL COMMENT '任务模板数组（JSON）',
    sort_order INT DEFAULT 0 COMMENT '排序序号',
    status TINYINT DEFAULT 1 COMMENT '状态：1启用 0禁用',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    created_by BIGINT DEFAULT NULL COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_by BIGINT DEFAULT NULL COMMENT '更新人',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_key (`key`),
    INDEX idx_sort_order (sort_order),
    INDEX idx_is_system (is_system),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目阶段表';

-- 2. 插入预置阶段
INSERT INTO t_stage (`key`, name, description, icon, color, progress_mode, is_system, default_weight, sort_order) VALUES
('pre_sale', '售前调研', '项目售前阶段的调研和评估', 'Search', '#52c41a', 'by_device', 1, 0, 1),
('preparation', '准备阶段', '施工前的准备工作', 'Setup', '#1890ff', 'by_device', 1, 20, 2),
('construction', '施工阶段', '设备安装和施工', 'Build', '#722ed1', 'by_device', 1, 30, 3),
('configuration', '配置阶段', '设备配置和调试', 'Setting', '#fa8c16', 'by_device', 1, 30, 4),
('verification', '核对阶段', '数据核对和验证', 'CheckCircle', '#13c2c2', 'by_device', 1, 20, 5),
('acceptance', '验收阶段', '项目验收和交付', 'CheckSquare', '#52c41a', 'by_device', 1, 0, 6)
ON DUPLICATE KEY UPDATE `key`=`key`;

SELECT '✅ 项目阶段模块数据库迁移完成！' AS message;
SELECT COUNT(*) AS stage_count FROM t_stage WHERE deleted = 0;

-- =============================================
-- 迁移完成总结
-- =============================================
SELECT '============================================' AS '';
SELECT '✅ P0第一批数据库迁移全部完成！' AS '';
SELECT '============================================' AS '';
SELECT CONCAT('权限数量: ', COUNT(*)) AS summary FROM t_permission WHERE deleted = 0
UNION ALL
SELECT CONCAT('阶段数量: ', COUNT(*)) FROM t_stage WHERE deleted = 0;
