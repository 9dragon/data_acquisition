USE data_acquisition;

-- 删除设备类型表中的工序相关字段
ALTER TABLE t_device_type DROP COLUMN IF EXISTS process_id;
ALTER TABLE t_device_type DROP COLUMN IF EXISTS process_name;

-- 删除工序表
DROP TABLE IF EXISTS t_process;

-- 删除工序管理权限
DELETE FROM t_permission WHERE permission_code = 'process:manage';

SELECT '工序模块删除完成' AS message;
