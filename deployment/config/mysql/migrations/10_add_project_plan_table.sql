-- 项目计划表
CREATE TABLE IF NOT EXISTS t_project_plan (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    name VARCHAR(200) NOT NULL COMMENT '计划名称',
    description TEXT COMMENT '计划描述',
    start_date DATE NOT NULL COMMENT '计划开始日期',
    end_date DATE NOT NULL COMMENT '计划结束日期',
    stages_json TEXT COMMENT '阶段配置JSON',
    created_by VARCHAR(50) COMMENT '创建人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_by VARCHAR(50) COMMENT '更新人',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记(0=未删除,1=已删除)',
    INDEX idx_project_id (project_id),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目计划表';
