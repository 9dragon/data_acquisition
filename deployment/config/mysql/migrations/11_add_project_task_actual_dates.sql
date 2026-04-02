-- 为项目任务表添加实际时间字段
-- 执行时间: 2026-04-01
-- 说明: 用于记录任务的实际执行周期，支持计划vs实际对比分析

ALTER TABLE t_project_task
ADD COLUMN actual_start_date DATE COMMENT '实际开始日期（任务开始执行时记录）',
ADD COLUMN actual_end_date DATE COMMENT '实际完成日期（任务完成时记录）';

-- 添加索引以提高查询性能
ALTER TABLE t_project_task
ADD INDEX idx_actual_start_date (actual_start_date),
ADD INDEX idx_actual_end_date (actual_end_date);
