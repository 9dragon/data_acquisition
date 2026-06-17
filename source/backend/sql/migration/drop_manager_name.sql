-- =====================================================
-- 废弃 t_project.manager_name 字段
-- 用途：项目负责人 / 项目经理 数据源统一到 t_project_member(role=MANAGER)
--
-- ⚠️ 执行顺序：
--   1. 必须先执行 project_member.sql（建表 + 历史 manager_name 回填到 t_project_member）
--   2. 部署最新后端代码（Project 实体已不再映射 manager_name 列，
--      改由 t_project_member JOIN t_user 动态填充 managerName）
--   3. PC 端验证：项目列表经理姓名正确显示、编辑项目经理正确同步到 t_project_member
--   4. 全部验证通过后，再执行本脚本 DROP 列（不可逆）
--
-- 执行方式：在远程 MySQL 手动执行
-- =====================================================

-- 1. 安全检查：列出尚未回填 MANAGER 的项目（应为空才可继续）
-- SELECT p.id, p.name, p.manager_name
-- FROM t_project p
-- LEFT JOIN t_project_member pm
--   ON pm.project_id = p.id AND pm.role = 'MANAGER' AND pm.is_active = 1 AND pm.deleted = 0
-- WHERE p.deleted = 0 AND p.manager_name IS NOT NULL AND p.manager_name <> '' AND pm.id IS NULL;

-- 2. 删除 manager_name 列
ALTER TABLE `t_project` DROP COLUMN `manager_name`;
