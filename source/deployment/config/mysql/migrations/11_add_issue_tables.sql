-- 问题管理模块数据库表
-- 创建时间: 2026-04-02

-- 问题主表
CREATE TABLE IF NOT EXISTS t_issue (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    code VARCHAR(50) UNIQUE COMMENT '问题编号',
    title VARCHAR(200) NOT NULL COMMENT '问题标题',
    type ENUM('device', 'plan', 'technical', 'resource', 'other') NOT NULL DEFAULT 'other' COMMENT '问题类型',
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium' COMMENT '优先级',
    status ENUM('open', 'assigned', 'in_progress', 'resolved', 'closed', 'reopened') DEFAULT 'open' COMMENT '问题状态',
    description TEXT COMMENT '问题描述',
    project_id BIGINT NOT NULL COMMENT '所属项目ID',
    device_id BIGINT COMMENT '关联设备ID',
    reporter_id BIGINT NOT NULL COMMENT '报告人ID',
    assignee_id BIGINT COMMENT '负责人ID',
    cc_users JSON COMMENT '抄送人ID列表',
    due_date DATE COMMENT '预计解决时间',
    resolved_at DATETIME COMMENT '实际解决时间',
    closed_at DATETIME COMMENT '关闭时间',
    closed_reason VARCHAR(500) COMMENT '关闭原因',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_project_id (project_id),
    INDEX idx_device_id (device_id),
    INDEX idx_reporter_id (reporter_id),
    INDEX idx_assignee_id (assignee_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='问题表';

-- 问题评论表
CREATE TABLE IF NOT EXISTS t_issue_comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    issue_id BIGINT NOT NULL COMMENT '问题ID',
    content TEXT NOT NULL COMMENT '评论内容',
    author_id BIGINT NOT NULL COMMENT '评论人ID',
    is_internal TINYINT(1) DEFAULT 0 COMMENT '是否内部评论',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_issue_id (issue_id),
    INDEX idx_author_id (author_id),
    FOREIGN KEY (issue_id) REFERENCES t_issue(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='问题评论表';

-- 问题状态变更历史表
CREATE TABLE IF NOT EXISTS t_issue_status_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    issue_id BIGINT NOT NULL COMMENT '问题ID',
    from_status VARCHAR(20) COMMENT '变更前状态',
    to_status VARCHAR(20) COMMENT '变更后状态',
    operator_id BIGINT NOT NULL COMMENT '操作人ID',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_issue_id (issue_id),
    INDEX idx_operator_id (operator_id),
    FOREIGN KEY (issue_id) REFERENCES t_issue(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='问题状态变更历史表';

-- 问题附件表
CREATE TABLE IF NOT EXISTS t_issue_attachment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    issue_id BIGINT NOT NULL COMMENT '问题ID',
    name VARCHAR(200) NOT NULL COMMENT '文件名',
    url VARCHAR(500) NOT NULL COMMENT '文件URL',
    size BIGINT COMMENT '文件大小(字节)',
    file_type VARCHAR(50) COMMENT '文件类型',
    uploader_id BIGINT NOT NULL COMMENT '上传人ID',
    upload_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    INDEX idx_issue_id (issue_id),
    FOREIGN KEY (issue_id) REFERENCES t_issue(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='问题附件表';

-- 插入预置问题类型数据 (如需使用字典表，可取消注释)
-- INSERT INTO sys_dict (dict_type, dict_label, dict_value, sort_order, status, create_time) 
-- SELECT 'issue_type', '设备问题', 'device', 1, 1, NOW() WHERE NOT EXISTS (SELECT 1 FROM sys_dict WHERE dict_type = 'issue_type' AND dict_value = 'device');
