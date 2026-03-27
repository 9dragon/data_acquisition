-- =============================================
-- P0第一批项目阶段模块数据库迁移脚本
-- 版本: V1.0
-- 日期: 2026-03-26
-- =============================================

USE data_acquisition;

-- 1. 创建项目阶段表
CREATE TABLE IF NOT EXISTS t_stage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '阶段ID',
    `key` VARCHAR(50) NOT NULL UNIQUE COMMENT '阶段唯一标识',
    name VARCHAR(100) NOT NULL COMMENT '阶段名称',
    description VARCHAR(500) DEFAULT NULL COMMENT '阶段描述',
    icon VARCHAR(50) DEFAULT NULL COMMENT '图标',
    color VARCHAR(20) DEFAULT NULL COMMENT '显示颜色',
    progress_mode ENUM('by_task', 'by_device') NOT NULL DEFAULT 'by_device' COMMENT '推进方式',
    is_system INT DEFAULT 0 COMMENT '是否系统预置',
    default_weight INT DEFAULT 0 COMMENT '默认权重 0-100',
    task_templates JSON DEFAULT NULL COMMENT '任务模板数组（JSON）',
    sort_order INT DEFAULT 0 COMMENT '排序序号',
    status TINYINT DEFAULT 1 COMMENT '状态：1启用 0禁用',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    created_by BIGINT DEFAULT NULL COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_by BIGINT DEFAULT NULL COMMENT '更新人',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_key (`key`),
    INDEX idx_sort_order (sort_order),
    INDEX idx_is_system (is_system),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目阶段表';

-- 2. 插入预置阶段
INSERT INTO t_stage (`key`, name, description, icon, color, progress_mode, is_system, default_weight, sort_order) VALUES
('pre_sale', '售前调研', '项目售前阶段的调研和评估', 'Search', '#52c41a', 'by_device', 1, 0, 1),
('preparation', '准备阶段', '施工前的准备工作', 'Setup', '#1890ff', 'by_device', 1, 20, 2),
('construction', '施工阶段', '设备安装和施工', 'Build', '#722ed1', 'by_device', 1, 30, 3),
('configuration', '配置阶段', '设备配置和调试', 'Setting', '#fa8c16', 'by_device', 1, 30, 4),
('verification', '核对阶段', '数据核对和验证', 'CheckCircle', '#13c2c2', 'by_device', 1, 20, 5),
('acceptance', '验收阶段', '项目验收和交付', 'CheckSquare', '#52c41a', 'by_device', 1, 0, 6)
ON DUPLICATE KEY UPDATE `key`=`key`;

-- 迁移完成提示
SELECT '项目阶段模块数据库迁移完成！' AS message;
SELECT COUNT(*) AS stage_count FROM t_stage WHERE deleted = 0;
