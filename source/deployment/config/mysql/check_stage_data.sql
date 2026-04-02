-- =============================================
-- 检查阶段表中的任务模板数据
-- =============================================

USE data_acquisition;

-- 检查当前 task_templates 字段的值
SELECT
    id,
    `key`,
    name,
    task_templates,
    JSON_LENGTH(task_templates) AS task_count
FROM t_stage
WHERE deleted = 0;
