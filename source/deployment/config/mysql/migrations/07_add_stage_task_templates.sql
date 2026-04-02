-- =============================================
-- 为预置阶段添加任务模板数据
-- 版本: V1.0
-- 日期: 2026-03-30
-- =============================================

USE data_acquisition;

-- 1. 更新售前调研阶段的任务模板
UPDATE t_stage SET task_templates = JSON_ARRAY(
    JSON_OBJECT(
        'id', UUID(),
        'key', 'site_survey',
        'name', '现场勘查',
        'description', '对项目现场进行实地勘查，了解现场环境和条件',
        'defaultWeight', 30,
        'materialRequirements', JSON_ARRAY(
            JSON_OBJECT('key', 'site_photo', 'name', '现场照片', 'fileType', 'image', 'required', true, 'minCount', 1, 'maxCount', 10)
        )
    ),
    JSON_OBJECT(
        'id', UUID(),
        'key', 'requirement_analysis',
        'name', '需求分析',
        'description', '分析客户需求，确定技术方案',
        'defaultWeight', 40,
        'materialRequirements', JSON_ARRAY(
            JSON_OBJECT('key', 'requirement_doc', 'name', '需求文档', 'fileType', 'document', 'required', true, 'minCount', 1, 'maxCount', 1)
        )
    ),
    JSON_OBJECT(
        'id', UUID(),
        'key', 'proposal_design',
        'name', '方案设计',
        'description', '根据需求分析结果，设计技术实施方案',
        'defaultWeight', 30,
        'materialRequirements', JSON_ARRAY(
            JSON_OBJECT('key', 'proposal_doc', 'name', '方案文档', 'fileType', 'document', 'required', true, 'minCount', 1, 'maxCount', 1)
        )
    )
) WHERE `key` = 'pre_sale';

-- 2. 更新准备阶段的任务模板
UPDATE t_stage SET task_templates = JSON_ARRAY(
    JSON_OBJECT(
        'id', UUID(),
        'key', 'device_check',
        'name', '设备清单确认',
        'description', '确认项目所需的设备清单和规格',
        'defaultWeight', 30,
        'materialRequirements', JSON_ARRAY(
            JSON_OBJECT('key', 'device_list', 'name', '设备清单', 'fileType', 'document', 'required', true, 'minCount', 1, 'maxCount', 1)
        )
    ),
    JSON_OBJECT(
        'id', UUID(),
        'key', 'construction_plan',
        'name', '施工方案制定',
        'description', '制定详细的施工计划和实施方案',
        'defaultWeight', 40,
        'materialRequirements', JSON_ARRAY(
            JSON_OBJECT('key', 'construction_plan', 'name', '施工方案', 'fileType', 'document', 'required', true, 'minCount', 1, 'maxCount', 1)
        )
    ),
    JSON_OBJECT(
        'id', UUID(),
        'key', 'material_prepare',
        'name', '材料准备',
        'description', '准备施工所需的材料和工具',
        'defaultWeight', 30,
        'materialRequirements', JSON_ARRAY(
            JSON_OBJECT('key', 'material_list', 'name', '材料清单', 'fileType', 'document', 'required', true, 'minCount', 1, 'maxCount', 1)
        )
    )
) WHERE `key` = 'preparation';

-- 3. 更新施工阶段的任务模板
UPDATE t_stage SET task_templates = JSON_ARRAY(
    JSON_OBJECT(
        'id', UUID(),
        'key', 'device_install',
        'name', '设备安装',
        'description', '按照设计方案进行设备安装',
        'defaultWeight', 40,
        'materialRequirements', JSON_ARRAY(
            JSON_OBJECT('key', 'install_photo', 'name', '安装照片', 'fileType', 'image', 'required', true, 'minCount', 1, 'maxCount', 20)
        )
    ),
    JSON_OBJECT(
        'id', UUID(),
        'key', 'cable_laying',
        'name', '线路敷设',
        'description', '进行网络和电源线路的敷设',
        'defaultWeight', 30,
        'materialRequirements', JSON_ARRAY(
            JSON_OBJECT('key', 'cable_photo', 'name', '线路照片', 'fileType', 'image', 'required', true, 'minCount', 1, 'maxCount', 10)
        )
    ),
    JSON_OBJECT(
        'id', UUID(),
        'key', 'device_debug',
        'name', '设备调试',
        'description', '对安装的设备进行初步调试',
        'defaultWeight', 30,
        'materialRequirements', JSON_ARRAY(
            JSON_OBJECT('key', 'debug_report', 'name', '调试报告', 'fileType', 'document', 'required', true, 'minCount', 1, 'maxCount', 1)
        )
    )
) WHERE `key` = 'construction';

-- 4. 更新配置阶段的任务模板
UPDATE t_stage SET task_templates = JSON_ARRAY(
    JSON_OBJECT(
        'id', UUID(),
        'key', 'param_config',
        'name', '参数配置',
        'description', '配置设备的运行参数',
        'defaultWeight', 35,
        'materialRequirements', JSON_ARRAY(
            JSON_OBJECT('key', 'param_list', 'name', '参数清单', 'fileType', 'document', 'required', true, 'minCount', 1, 'maxCount', 1)
        )
    ),
    JSON_OBJECT(
        'id', UUID(),
        'key', 'network_config',
        'name', '网络配置',
        'description', '配置网络连接和通信参数',
        'defaultWeight', 35,
        'materialRequirements', JSON_ARRAY(
            JSON_OBJECT('key', 'network_config', 'name', '网络配置表', 'fileType', 'document', 'required', true, 'minCount', 1, 'maxCount', 1)
        )
    ),
    JSON_OBJECT(
        'id', UUID(),
        'key', 'function_test',
        'name', '功能测试',
        'description', '测试设备各项功能是否正常',
        'defaultWeight', 30,
        'materialRequirements', JSON_ARRAY(
            JSON_OBJECT('key', 'test_report', 'name', '测试报告', 'fileType', 'document', 'required', true, 'minCount', 1, 'maxCount', 1)
        )
    )
) WHERE `key` = 'configuration';

-- 5. 更新核对阶段的任务模板
UPDATE t_stage SET task_templates = JSON_ARRAY(
    JSON_OBJECT(
        'id', UUID(),
        'key', 'data_verification',
        'name', '数据核对',
        'description', '核对采集的数据是否准确完整',
        'defaultWeight', 50,
        'materialRequirements', JSON_ARRAY(
            JSON_OBJECT('key', 'data_sample', 'name', '数据样本', 'fileType', 'document', 'required', true, 'minCount', 1, 'maxCount', 1)
        )
    ),
    JSON_OBJECT(
        'id', UUID(),
        'key', 'report_generate',
        'name', '报表生成',
        'description', '生成数据核对报表',
        'defaultWeight', 30,
        'materialRequirements', JSON_ARRAY(
            JSON_OBJECT('key', 'verification_report', 'name', '核对报表', 'fileType', 'document', 'required', true, 'minCount', 1, 'maxCount', 1)
        )
    ),
    JSON_OBJECT(
        'id', UUID(),
        'key', 'issue_fix',
        'name', '问题修复',
        'description', '修复核对过程中发现的问题',
        'defaultWeight', 20,
        'materialRequirements', JSON_ARRAY()
    )
) WHERE `key` = 'verification';

-- 6. 更新验收阶段的任务模板
UPDATE t_stage SET task_templates = JSON_ARRAY(
    JSON_OBJECT(
        'id', UUID(),
        'key', 'acceptance_test',
        'name', '验收测试',
        'description', '进行项目验收测试',
        'defaultWeight', 40,
        'materialRequirements', JSON_ARRAY(
            JSON_OBJECT('key', 'acceptance_report', 'name', '验收报告', 'fileType', 'document', 'required', true, 'minCount', 1, 'maxCount', 1)
        )
    ),
    JSON_OBJECT(
        'id', UUID(),
        'key', 'doc_delivery',
        'name', '文档交付',
        'description', '整理并交付项目相关文档',
        'defaultWeight', 30,
        'materialRequirements', JSON_ARRAY(
            JSON_OBJECT('key', 'project_docs', 'name', '项目文档', 'fileType', 'document', 'required', true, 'minCount', 1, 'maxCount', 10)
        )
    ),
    JSON_OBJECT(
        'id', UUID(),
        'key', 'training',
        'name', '用户培训',
        'description', '对用户进行系统使用培训',
        'defaultWeight', 30,
        'materialRequirements', JSON_ARRAY(
            JSON_OBJECT('key', 'training_material', 'name', '培训材料', 'fileType', 'document', 'required', true, 'minCount', 1, 'maxCount', 1)
        )
    )
) WHERE `key` = 'acceptance';

-- 验证更新结果
SELECT `key`, name, JSON_LENGTH(task_templates) AS task_count FROM t_stage WHERE deleted = 0;

SELECT '任务模板数据添加完成！' AS message;
