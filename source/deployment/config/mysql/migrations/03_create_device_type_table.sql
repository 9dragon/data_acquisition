-- 设备类型表
-- 用于对设备进行分类管理，支持按项目和工序进行筛选和联动
-- 创建时间: 2026-03-27

USE data_acquisition;

CREATE TABLE IF NOT EXISTS t_device_type (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    project_id BIGINT NOT NULL COMMENT '所属项目ID',
    project_name VARCHAR(100) COMMENT '所属项目名称（冗余字段）',
    process_id BIGINT COMMENT '所属工序ID',
    process_name VARCHAR(100) COMMENT '所属工序名称（冗余字段）',
    code VARCHAR(50) NOT NULL COMMENT '类型编码',
    name VARCHAR(100) NOT NULL COMMENT '类型名称',
    description TEXT COMMENT '类型描述',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_by BIGINT COMMENT '更新人ID',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记（0=未删除，1=已删除）',

    -- 唯一约束：同一项目下编码唯一
    CONSTRAINT uk_project_code UNIQUE (project_id, code),

    -- 索引
    INDEX idx_project_id (project_id),
    INDEX idx_process_id (process_id),
    INDEX idx_deleted (deleted)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备类型表';

-- 初始化完成提示
SELECT '设备类型表创建完成！' AS message;
