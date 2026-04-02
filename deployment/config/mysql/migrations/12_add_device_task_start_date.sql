-- 为设备任务表添加开始日期字段
-- 执行时间: 2026-04-01
-- 说明: 用于记录设备任务的实际开始时间

ALTER TABLE t_device_task
ADD COLUMN start_date DATE COMMENT '实际开始日期（任务开始执行时记录）';

-- 添加索引以提高查询性能
ALTER TABLE t_device_task
ADD INDEX idx_start_date (start_date);
