-- 添加项目负责人姓名字段和优先级字段，删除项目经理ID字段
-- 执行时间: 2026-03-30

ALTER TABLE t_project ADD COLUMN manager_name VARCHAR(50) COMMENT '项目负责人姓名' AFTER manager_id;
ALTER TABLE t_project ADD COLUMN priority INT DEFAULT 1 COMMENT '优先级：0=低, 1=中, 2=高, 3=紧急';
ALTER TABLE t_project DROP COLUMN manager_id;
