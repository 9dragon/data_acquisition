-- ============================================
-- 角色权限管理改进 - 数据迁移脚本
-- 执行顺序：1. 先执行此脚本进行数据迁移
--          2. 再执行更新后的 init_schema.sql
-- ============================================

USE data_acquisition;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Step 1: 创建关联表
-- ----------------------------

-- 创建用户角色关联表
DROP TABLE IF EXISTS `t_user_role`;
CREATE TABLE `t_user_role` (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` bigint(0) NOT NULL COMMENT '用户ID',
  `role_id` bigint(0) NOT NULL COMMENT '角色ID',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_user_role`(`user_id`, `role_id`),
  INDEX `idx_role_id`(`role_id`)
) ENGINE=InnoDB COMMENT='用户角色关联表';

-- 创建角色权限关联表
DROP TABLE IF EXISTS `t_role_permission`;
CREATE TABLE `t_role_permission` (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `role_id` bigint(0) NOT NULL COMMENT '角色ID',
  `permission_id` bigint(0) NOT NULL COMMENT '权限ID',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_role_permission`(`role_id`, `permission_id`),
  INDEX `idx_permission_id`(`permission_id`)
) ENGINE=InnoDB COMMENT='角色权限关联表';

-- ----------------------------
-- Step 2: 数据迁移 - t_user.role_ids -> t_user_role
-- ----------------------------

-- 将用户表的role_ids字段数据迁移到t_user_role表
INSERT INTO t_user_role (user_id, role_id, created_at)
SELECT
    u.id as user_id,
    CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(u.role_ids, ',', n.n), ',', -1)) AS SIGNED) as role_id,
    u.created_at
FROM t_user u
INNER JOIN (
    -- 生成数字序列 1-10（根据最大角色数调整）
    SELECT 1 as n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
    UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
) n
ON n.n <= LENGTH(u.role_ids) - LENGTH(REPLACE(u.role_ids, ',', '')) + 1
WHERE u.role_ids IS NOT NULL AND u.role_ids != '';

-- ----------------------------
-- Step 3: 数据迁移 - t_role.permissions -> t_role_permission
-- ----------------------------

-- 将角色表的permissions字段数据迁移到t_role_permission表
INSERT INTO t_role_permission (role_id, permission_id, created_at)
SELECT
    r.id as role_id,
    CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(r.permissions, ',', n.n), ',', -1)) AS SIGNED) as permission_id,
    r.created_at
FROM t_role r
INNER JOIN (
    -- 生成数字序列 1-50（根据最大权限数调整）
    SELECT 1 as n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
    UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
    UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
    UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
    UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25
    UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
    UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35
    UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40
    UNION SELECT 41 UNION SELECT 42 UNION SELECT 43 UNION SELECT 44 UNION SELECT 45
    UNION SELECT 46 UNION SELECT 47 UNION SELECT 48 UNION SELECT 49 UNION SELECT 50
) n
ON n.n <= LENGTH(r.permissions) - LENGTH(REPLACE(r.permissions, ',', '')) + 1
WHERE r.permissions IS NOT NULL AND r.permissions != '';

-- ----------------------------
-- Step 4: 验证迁移结果
-- ----------------------------

-- 查看迁移后的用户角色关联数据
SELECT 't_user_role 迁移数据:' as info;
SELECT COUNT(*) as total_records FROM t_user_role;

-- 查看迁移后的角色权限关联数据
SELECT 't_role_permission 迁移数据:' as info;
SELECT COUNT(*) as total_records FROM t_role_permission;

-- 验证有角色的用户数
SELECT '有角色的用户数:' as info;
SELECT COUNT(DISTINCT user_id) FROM t_user_role;

-- 验证有权限的角色数
SELECT '有权限的角色数:' as info;
SELECT COUNT(DISTINCT role_id) FROM t_role_permission;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 迁移完成
-- 下一步：修改 t_user 表（删除 role_ids 字段）
--         修改 t_role 表（删除 permissions 字段）
--         修改 t_permission 表（可选，删除 method 字段）
-- ============================================
