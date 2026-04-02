-- 创建设备任务表
-- 执行时间: 2026-03-31
-- 说明: 用于存储设备级任务进度，支持按设备推进的任务管理

CREATE TABLE t_device_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    device_id BIGINT NOT NULL COMMENT '设备ID',
    device_name VARCHAR(100) COMMENT '设备名称',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    project_name VARCHAR(200) COMMENT '项目名称',
    stage_key VARCHAR(50) NOT NULL COMMENT '阶段标识: preparation=准备, construction=施工, configuration=配置, verification=核对',
    stage_name VARCHAR(50) COMMENT '阶段名称',
    task_key VARCHAR(100) NOT NULL COMMENT '任务唯一标识',
    task_name VARCHAR(200) NOT NULL COMMENT '任务名称',
    completed BOOLEAN DEFAULT FALSE COMMENT '是否完成',
    completed_date DATETIME COMMENT '完成日期',
    remark TEXT COMMENT '备注',
    materials JSON COMMENT '任务资料，存储TaskMaterial数组',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_by BIGINT COMMENT '更新人ID',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记（0=未删除，1=已删除）',
    INDEX idx_device_id (device_id),
    INDEX idx_project_id (project_id),
    INDEX idx_stage_key (stage_key),
    INDEX idx_completed (completed),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备任务表';
