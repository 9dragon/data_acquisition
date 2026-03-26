-- 数据采集系统数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS data_acquisition CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE data_acquisition;

-- 用户表
CREATE TABLE IF NOT EXISTS t_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    avatar VARCHAR(255) COMMENT '头像URL',
    role_ids VARCHAR(255) COMMENT '角色ID列表（逗号分隔）',
    status INT DEFAULT 1 COMMENT '状态：0=禁用, 1=启用',
    last_login_time VARCHAR(50) COMMENT '最后登录时间',
    last_login_ip VARCHAR(50) COMMENT '最后登录IP',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_by BIGINT COMMENT '更新人ID',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记（0=未删除，1=已删除）',
    INDEX idx_username (username),
    INDEX idx_status (status),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 插入默认管理员用户
-- 用户名: admin
-- 密码: admin123
-- BCrypt 加密后的密码哈希值
INSERT INTO t_user (username, password, name, email, status, role_ids)
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKfGXWO6', '系统管理员', 'admin@example.com', 1, '1')
ON DUPLICATE KEY UPDATE username=username;

-- 角色表
CREATE TABLE IF NOT EXISTS t_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    name VARCHAR(50) NOT NULL COMMENT '角色名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    description VARCHAR(255) COMMENT '角色描述',
    status INT DEFAULT 1 COMMENT '状态：0=禁用, 1=启用',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_by BIGINT COMMENT '更新人ID',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_code (code),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 插入默认角色
INSERT INTO t_role (id, name, code, description, status)
VALUES (1, '超级管理员', 'ADMIN', '系统超级管理员，拥有所有权限', 1)
ON DUPLICATE KEY UPDATE name=name;

-- 项目表
CREATE TABLE IF NOT EXISTS t_project (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    name VARCHAR(100) NOT NULL COMMENT '项目名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '项目编号',
    customer VARCHAR(100) COMMENT '客户名称',
    description TEXT COMMENT '项目描述',
    status INT DEFAULT 0 COMMENT '状态：0=待启动, 1=进行中, 2=已完成, 3=已取消',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    manager_id BIGINT COMMENT '项目经理ID',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_by BIGINT COMMENT '更新人ID',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_code (code),
    INDEX idx_status (status),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目表';

-- 车间表
CREATE TABLE IF NOT EXISTS t_workshop (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    project_id BIGINT NOT NULL COMMENT '所属项目ID',
    name VARCHAR(100) NOT NULL COMMENT '车间名称',
    code VARCHAR(50) COMMENT '车间编号',
    description TEXT COMMENT '车间描述',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_by BIGINT COMMENT '更新人ID',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_project_id (project_id),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车间表';

-- 工序表
CREATE TABLE IF NOT EXISTS t_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    project_id BIGINT NOT NULL COMMENT '所属项目ID',
    workshop_id BIGINT COMMENT '所属车间ID',
    name VARCHAR(100) NOT NULL COMMENT '工序名称',
    code VARCHAR(50) COMMENT '工序编号',
    description TEXT COMMENT '工序描述',
    sequence_no INT COMMENT '排序号',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_by BIGINT COMMENT '更新人ID',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_project_id (project_id),
    INDEX idx_workshop_id (workshop_id),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工序表';

-- 设备表
CREATE TABLE IF NOT EXISTS t_device (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    project_id BIGINT NOT NULL COMMENT '所属项目ID',
    workshop_id BIGINT COMMENT '所属车间ID',
    process_id BIGINT COMMENT '所属工序ID',
    name VARCHAR(100) NOT NULL COMMENT '设备名称',
    code VARCHAR(50) COMMENT '设备编号',
    category VARCHAR(50) COMMENT '设备分类',
    manufacturer VARCHAR(100) COMMENT '制造商',
    model VARCHAR(100) COMMENT '型号',
    status INT DEFAULT 0 COMMENT '状态：0=未开始, 1=进行中, 2=已完成, 3=异常',
    ip VARCHAR(50) COMMENT 'IP地址',
    port INT COMMENT '端口',
    collection_method VARCHAR(50) COMMENT '采集方式',
    responsible_person_id BIGINT COMMENT '负责人ID',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_by BIGINT COMMENT '更新人ID',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_project_id (project_id),
    INDEX idx_workshop_id (workshop_id),
    INDEX idx_process_id (process_id),
    INDEX idx_status (status),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备表';

-- 初始化完成提示
SELECT '数据库初始化完成！' AS message;
SELECT '默认管理员账号：admin' AS username;
SELECT '默认管理员密码：admin123' AS password;
