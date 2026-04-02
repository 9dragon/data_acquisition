-- 删除设备表中的状态、进度、负责人字段
-- 创建时间: 2026-03-27

USE data_acquisition;

-- 删除设备表中不再需要的字段
ALTER TABLE t_device DROP COLUMN IF EXISTS status;
ALTER TABLE t_device DROP COLUMN IF EXISTS progress;
ALTER TABLE t_device DROP COLUMN IF EXISTS responsible_person_id;
ALTER TABLE t_device DROP COLUMN IF EXISTS responsible_person_name;

SELECT '设备字段删除完成' AS message;
