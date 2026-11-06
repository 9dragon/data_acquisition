-- =====================================================================
-- 需求：移动端设备调研-接口类型增加选项「RJ45/交换机」
-- 说明：设备调研下拉选项存储于 t_system_config（config_key = device_research.interface_type）
--      config_value 为 JSON 数组，此脚本向其中追加新选项（已存在则跳过）
--      注意：该配置有 Redis 缓存（system:config:device_research.interface_type，1小时），
--           执行后在系统管理-选项配置页保存一次即可刷新缓存，或手动删除该 Redis key
-- 执行方式：远程 MySQL，请手动执行
-- =====================================================================

-- 1. 已存在配置行：追加选项（避免重复添加）
UPDATE t_system_config
SET config_value = JSON_ARRAY_APPEND(config_value, '$', 'RJ45/交换机')
WHERE config_key = 'device_research.interface_type'
  AND deleted = 0
  AND JSON_SEARCH(config_value, 'one', 'RJ45/交换机') IS NULL;

-- 2. 若配置行不存在：插入默认接口类型选项
INSERT INTO t_system_config (config_key, config_value, config_type, category, is_system)
SELECT 'device_research.interface_type',
       JSON_ARRAY('RJ45/交换机', 'RJ45', 'RS232', 'RS485'),
       'JSON',
       'device_research',
       0
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM t_system_config
    WHERE config_key = 'device_research.interface_type' AND deleted = 0
);

-- 验证
SELECT config_key, config_value FROM t_system_config WHERE config_key = 'device_research.interface_type';
