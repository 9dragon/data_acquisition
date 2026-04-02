-- 移除项目计划表的唯一约束
-- 允许一个项目可以有多个计划
-- 执行时间: 2026-03-31

ALTER TABLE t_project_plan DROP INDEX uk_project_id;
