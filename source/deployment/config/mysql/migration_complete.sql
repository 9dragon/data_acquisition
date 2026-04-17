-- ============================================
-- 角色权限管理改进 - 完整数据库变更
-- 执行前请备份数据库！
-- ============================================

-- 步骤1: 执行数据迁移脚本（迁移旧数据到新表）
-- SOURCE migration_role_permission.sql;

-- 步骤2: 更新 t_user 表（删除 role_ids 字段）
ALTER TABLE t_user DROP COLUMN IF EXISTS role_ids;

-- 步骤3: 更新 t_role 表（删除 permissions 字段）
ALTER TABLE t_role DROP COLUMN IF EXISTS permissions;

-- 步骤4: 更新 t_permission 表（删除 method 字段，移除 api 类型）
ALTER TABLE t_permission DROP COLUMN IF EXISTS method;
ALTER TABLE t_permission MODIFY COLUMN type ENUM('menu', 'button') NOT NULL DEFAULT 'button' COMMENT '权限类型：menu-菜单, button-按钮';

-- 步骤5: 清理旧数据（删除所有 api 类型的权限）
DELETE FROM t_permission WHERE type = 'api';

-- ============================================
-- 验证查询
-- ============================================

-- 验证 t_user_role 表
-- SELECT COUNT(*) as user_role_count FROM t_user_role;

-- 验证 t_role_permission 表
-- SELECT COUNT(*) as role_permission_count FROM t_role_permission;

-- 验证 t_user 表结构
-- DESCRIBE t_user;

-- 验证 t_role 表结构
-- DESCRIBE t_role;

-- 验证 t_permission 表结构
-- DESCRIBE t_permission;
