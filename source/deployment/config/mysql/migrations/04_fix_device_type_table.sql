-- 修复设备类型表：允许 project_id 为空
-- 创建时间: 2026-03-27

USE data_acquisition;

-- 删除原有的唯一约束
ALTER TABLE t_device_type DROP INDEX uk_project_code;

-- 修改 project_id 为可空
ALTER TABLE t_device_type MODIFY COLUMN project_id BIGINT NULL COMMENT '所属项目ID';

-- 重新创建唯一约束（只对有 project_id 的记录生效）
-- 注意：MySQL不允许在包含NULL值的列上创建唯一约束
-- 所以我们需要移除这个约束，改为在应用层控制

SELECT '设备类型表修复完成！project_id 现在可以为空' AS message;
