-- ============================================
-- 权限数据初始化脚本
-- 根据前端菜单结构生成
-- ============================================

USE data_acquisition;

SET NAMES utf8mb4;

-- 先清空现有数据
DELETE FROM t_permission;

-- 重置自增ID
ALTER TABLE t_permission AUTO_INCREMENT = 1;

-- ============================================
-- 一级菜单 (parent_id = NULL)
-- ============================================
INSERT INTO t_permission (id, code, name, type, parent_id, path, description, sort_order, status) VALUES
-- 一级菜单
(1, 'dashboard', '工作台', 'menu', NULL, '/dashboard', '工作台', 1, 1),
(2, 'progress', '进度管理', 'menu', NULL, NULL, '进度管理菜单', 2, 1),
(3, 'project', '项目管理', 'menu', NULL, NULL, '项目管理菜单', 3, 1),
(4, 'device', '设备管理', 'menu', NULL, NULL, '设备管理菜单', 4, 1),
(5, 'issue', '问题管理', 'menu', NULL, NULL, '问题管理菜单', 5, 1),
(6, 'system', '系统管理', 'menu', NULL, NULL, '系统管理菜单', 6, 1);

-- ============================================
-- 进度管理子菜单
-- ============================================
INSERT INTO t_permission (id, code, name, type, parent_id, path, description, sort_order, status) VALUES
(10, 'plan', '项目计划', 'menu', 2, '/plan', '项目计划', 10, 1),
(11, 'tasks', '任务列表', 'menu', 2, '/tasks', '任务列表', 11, 1),
(12, 'attendance-list', '签到记录', 'menu', 2, '/attendance-list', '签到记录', 12, 1);

-- ============================================
-- 项目管理子菜单
-- ============================================
INSERT INTO t_permission (id, code, name, type, parent_id, path, description, sort_order, status) VALUES
(20, 'projects', '项目列表', 'menu', 3, '/projects', '项目列表', 20, 1),
(21, 'stages', '项目阶段', 'menu', 3, '/stages', '项目阶段', 21, 1);

-- ============================================
-- 设备管理子菜单
-- ============================================
INSERT INTO t_permission (id, code, name, type, parent_id, path, description, sort_order, status) VALUES
(30, 'devices', '设备列表', 'menu', 4, '/devices', '设备列表', 30, 1),
(31, 'device-research', '设备调研', 'menu', 4, '/device-research', '设备调研', 31, 1),
(32, 'device-types', '设备类型', 'menu', 4, '/device-types', '设备类型', 32, 1),
(33, 'workshops', '车间管理', 'menu', 4, '/workshops', '车间管理', 33, 1);

-- ============================================
-- 问题管理子菜单
-- ============================================
INSERT INTO t_permission (id, code, name, type, parent_id, path, description, sort_order, status) VALUES
(40, 'issue:list', '问题列表', 'menu', 5, '/issue', '问题列表', 40, 1),
(41, 'issue-my', '我的问题', 'menu', 5, '/issue/my', '我的问题', 41, 1),
(42, 'issue-stats', '问题统计', 'menu', 5, '/issue/stats', '问题统计', 42, 1);

-- ============================================
-- 系统管理子菜单
-- ============================================
INSERT INTO t_permission (id, code, name, type, parent_id, path, description, sort_order, status) VALUES
(50, 'users', '用户管理', 'menu', 6, '/users', '用户管理', 50, 1),
(51, 'roles', '角色管理', 'menu', 6, '/roles', '角色管理', 51, 1),
(52, 'attendance-config', '系统配置', 'menu', 6, '/attendance-config', '系统配置', 52, 1);

-- ============================================
-- 按钮权限 (menu类型的按钮)
-- ============================================

-- 工作台按钮
INSERT INTO t_permission (id, code, name, type, parent_id, description, sort_order, status) VALUES
(100, 'dashboard:view', '查看工作台', 'button', 1, '查看工作台', 100, 1);

-- 项目计划按钮
INSERT INTO t_permission (id, code, name, type, parent_id, description, sort_order, status) VALUES
(110, 'plan:view', '查看项目计划', 'button', 10, '查看项目计划', 110, 1),
(111, 'plan:create', '创建项目计划', 'button', 10, '创建项目计划', 111, 1),
(112, 'plan:edit', '编辑项目计划', 'button', 10, '编辑项目计划', 112, 1),
(113, 'plan:delete', '删除项目计划', 'button', 10, '删除项目计划', 113, 1);

-- 任务列表按钮
INSERT INTO t_permission (id, code, name, type, parent_id, description, sort_order, status) VALUES
(120, 'task:view', '查看任务', 'button', 11, '查看任务', 120, 1),
(121, 'task:create', '创建任务', 'button', 11, '创建任务', 121, 1),
(122, 'task:edit', '编辑任务', 'button', 11, '编辑任务', 122, 1),
(123, 'task:delete', '删除任务', 'button', 11, '删除任务', 123, 1);

-- 签到记录按钮
INSERT INTO t_permission (id, code, name, type, parent_id, description, sort_order, status) VALUES
(130, 'attendance:view', '查看签到记录', 'button', 12, '查看签到记录', 130, 1),
(131, 'attendance:create', '创建签到记录', 'button', 12, '创建签到记录', 131, 1),
(132, 'attendance:edit', '编辑签到记录', 'button', 12, '编辑签到记录', 132, 1),
(133, 'attendance:delete', '删除签到记录', 'button', 12, '删除签到记录', 133, 1);

-- 项目列表按钮
INSERT INTO t_permission (id, code, name, type, parent_id, description, sort_order, status) VALUES
(200, 'project:view', '查看项目', 'button', 20, '查看项目', 200, 1),
(201, 'project:create', '创建项目', 'button', 20, '创建项目', 201, 1),
(202, 'project:edit', '编辑项目', 'button', 20, '编辑项目', 202, 1),
(203, 'project:delete', '删除项目', 'button', 20, '删除项目', 203, 1),
(204, 'project:assign', '分配成员', 'button', 20, '分配项目成员', 204, 1);

-- 项目阶段按钮
INSERT INTO t_permission (id, code, name, type, parent_id, description, sort_order, status) VALUES
(210, 'stage:view', '查看阶段', 'button', 21, '查看阶段', 210, 1),
(211, 'stage:create', '创建阶段', 'button', 21, '创建阶段', 211, 1),
(212, 'stage:edit', '编辑阶段', 'button', 21, '编辑阶段', 212, 1),
(213, 'stage:delete', '删除阶段', 'button', 21, '删除阶段', 213, 1),
(214, 'stage:manage', '阶段配置', 'button', 21, '阶段配置管理', 214, 1);

-- 设备列表按钮
INSERT INTO t_permission (id, code, name, type, parent_id, description, sort_order, status) VALUES
(300, 'device:view', '查看设备', 'button', 30, '查看设备', 300, 1),
(301, 'device:create', '创建设备', 'button', 30, '创建设备', 301, 1),
(302, 'device:edit', '编辑设备', 'button', 30, '编辑设备', 302, 1),
(303, 'device:delete', '删除设备', 'button', 30, '删除设备', 303, 1);

-- 设备调研按钮
INSERT INTO t_permission (id, code, name, type, parent_id, description, sort_order, status) VALUES
(310, 'research:view', '查看调研', 'button', 31, '查看调研', 310, 1),
(311, 'research:create', '创建调研', 'button', 31, '创建调研', 311, 1),
(312, 'research:edit', '编辑调研', 'button', 31, '编辑调研', 312, 1),
(313, 'research:delete', '删除调研', 'button', 31, '删除调研', 313, 1);

-- 设备类型按钮
INSERT INTO t_permission (id, code, name, type, parent_id, description, sort_order, status) VALUES
(320, 'device-type:view', '查看设备类型', 'button', 32, '查看设备类型', 320, 1),
(321, 'device-type:create', '创建设备类型', 'button', 32, '创建设备类型', 321, 1),
(322, 'device-type:edit', '编辑设备类型', 'button', 32, '编辑设备类型', 322, 1),
(323, 'device-type:delete', '删除设备类型', 'button', 32, '删除设备类型', 323, 1);

-- 车间管理按钮
INSERT INTO t_permission (id, code, name, type, parent_id, description, sort_order, status) VALUES
(330, 'workshop:view', '查看车间', 'button', 33, '查看车间', 330, 1),
(331, 'workshop:create', '创建车间', 'button', 33, '创建车间', 331, 1),
(332, 'workshop:edit', '编辑车间', 'button', 33, '编辑车间', 332, 1),
(333, 'workshop:delete', '删除车间', 'button', 33, '删除车间', 333, 1);

-- 问题列表按钮
INSERT INTO t_permission (id, code, name, type, parent_id, description, sort_order, status) VALUES
(400, 'issue:view', '查看问题', 'button', 40, '查看问题', 400, 1),
(401, 'issue:create', '创建问题', 'button', 40, '创建问题', 401, 1),
(402, 'issue:edit', '编辑问题', 'button', 40, '编辑问题', 402, 1),
(403, 'issue:delete', '删除问题', 'button', 40, '删除问题', 403, 1);

-- 我的问题按钮
INSERT INTO t_permission (id, code, name, type, parent_id, description, sort_order, status) VALUES
(410, 'my-issue:view', '查看我的问题', 'button', 41, '查看我的问题', 410, 1);

-- 问题统计按钮
INSERT INTO t_permission (id, code, name, type, parent_id, description, sort_order, status) VALUES
(420, 'issue-stats:view', '查看问题统计', 'button', 42, '查看问题统计', 420, 1);

-- 用户管理按钮
INSERT INTO t_permission (id, code, name, type, parent_id, description, sort_order, status) VALUES
(500, 'user:view', '查看用户', 'button', 50, '查看用户', 500, 1),
(501, 'user:create', '创建用户', 'button', 50, '创建用户', 501, 1),
(502, 'user:edit', '编辑用户', 'button', 50, '编辑用户', 502, 1),
(503, 'user:delete', '删除用户', 'button', 50, '删除用户', 503, 1);

-- 角色管理按钮
INSERT INTO t_permission (id, code, name, type, parent_id, description, sort_order, status) VALUES
(510, 'role:view', '查看角色', 'button', 51, '查看角色', 510, 1),
(511, 'role:create', '创建角色', 'button', 51, '创建角色', 511, 1),
(512, 'role:edit', '编辑角色', 'button', 51, '编辑角色', 512, 1),
(513, 'role:delete', '删除角色', 'button', 51, '删除角色', 513, 1);

-- 系统配置按钮
INSERT INTO t_permission (id, code, name, type, parent_id, description, sort_order, status) VALUES
(520, 'config:view', '查看配置', 'button', 52, '查看配置', 520, 1),
(521, 'config:edit', '编辑配置', 'button', 52, '编辑配置', 521, 1);

-- ============================================
-- 验证数据
-- ============================================
SELECT '权限树结构:' AS info;
SELECT
    p.id,
    p.name AS '权限名称',
    p.code AS '权限编码',
    p.type AS '类型',
    CASE WHEN p.parent_id IS NULL THEN '根节点' ELSE p.parent_id END AS '父ID'
FROM t_permission p
ORDER BY p.parent_id, p.sort_order;
