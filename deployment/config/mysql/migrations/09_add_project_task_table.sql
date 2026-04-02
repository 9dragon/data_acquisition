-- 项目任务表
CREATE TABLE IF NOT EXISTS t_project_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    stage_key VARCHAR(50) NOT NULL COMMENT '阶段标识: planning=准备阶段, construction=施工阶段, configuration=配置阶段, verification=核对阶段',
    task_key VARCHAR(50) NOT NULL COMMENT '任务唯一标识',
    name VARCHAR(200) NOT NULL COMMENT '任务名称',
    description TEXT COMMENT '任务描述',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '任务状态: pending=未开始, in_progress=进行中, completed=已完成, cancelled=已取消',
    start_date DATE NOT NULL COMMENT '开始日期',
    end_date DATE NOT NULL COMMENT '结束日期',
    progress INT DEFAULT 0 COMMENT '完成进度0-100',
    assignee_ids VARCHAR(500) COMMENT '负责人ID列表(逗号分隔)',
    dependency_ids VARCHAR(500) COMMENT '依赖任务ID列表(逗号分隔)',
    created_by VARCHAR(50) COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_by VARCHAR(50) COMMENT '更新人',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_project_id (project_id),
    INDEX idx_stage_key (stage_key),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目任务表';
