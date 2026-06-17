/*
 Navicat Premium Data Transfer

 Source Server         : 10.1.2.230
 Source Server Type    : MySQL
 Source Server Version : 80045
 Source Host           : 10.1.2.230:3306
 Source Schema         : data_acquisition

 Target Server Type    : MySQL
 Target Server Version : 80045
 File Encoding         : 65001

 Date: 10/04/2026 15:47:07
*/

-- 使用数据库
USE data_acquisition;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for t_attendance_record
-- ----------------------------
DROP TABLE IF EXISTS `t_attendance_record`;
CREATE TABLE `t_attendance_record`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `project_id` bigint(0) NULL DEFAULT NULL COMMENT '项目ID',
  `user_id` bigint(0) NOT NULL COMMENT '用户ID',
  `user_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
  `check_in_time` datetime(0) NOT NULL COMMENT '签到时间',
  `photo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '签到照片URL',
  `location` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '签到位置',
  `latitude` decimal(10, 6) NULL DEFAULT NULL COMMENT '纬度',
  `longitude` decimal(10, 6) NULL DEFAULT NULL COMMENT '经度',
  `address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '详细地址',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'NORMAL' COMMENT '状态: NORMAL-正常, LATE-迟到',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '备注',
  `create_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `shift_index` int(0) NULL DEFAULT NULL COMMENT '时段索引: 1-第一次, 2-第二次, ...',
  `shift_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '时段名称: 上班打卡、下班打卡等',
  `is_late` tinyint(0) NULL DEFAULT 0 COMMENT '是否迟到: 0-否, 1-是',
  `original_photo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '原始照片URL(无水印)',
  `watermark_photo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '带水印照片URL',
  `photo_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '签到照片路径',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_check_in_time`(`check_in_time`) USING BTREE,
  INDEX `idx_project_id`(`project_id`) USING BTREE,
  INDEX `idx_user_date_shift`(`user_id`, `check_in_time`, `shift_index`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '签到记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_dd_department
-- ----------------------------
DROP TABLE IF EXISTS `t_dd_department`;
CREATE TABLE `t_dd_department`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `dept_id` bigint(0) NOT NULL COMMENT '钉钉部门ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '部门名称',
  `parent_id` bigint(0) NULL DEFAULT 0 COMMENT '父部门ID',
  `create_dept_group` tinyint(1) NULL DEFAULT 0 COMMENT '是否自动创建部门群',
  `auto_add_user` tinyint(1) NULL DEFAULT 0 COMMENT '是否自动添加成员',
  `create_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `update_time` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_dept_id`(`dept_id`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '钉钉部门表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_device
-- ----------------------------
DROP TABLE IF EXISTS `t_device`;
CREATE TABLE `t_device`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `type_id` bigint(0) NOT NULL COMMENT '设备类型ID',
  `project_id` bigint(0) NOT NULL COMMENT '所属项目ID',
  `workshop_id` bigint(0) NULL DEFAULT NULL COMMENT '所属车间ID',
  `process_id` bigint(0) NULL DEFAULT NULL COMMENT '所属工序ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '设备名称',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备编号',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备描述',
  `manufacturer` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '制造商',
  `model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '型号',
  `ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'IP地址',
  `port` int(0) NULL DEFAULT NULL COMMENT '端口',
  `collection_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '采集方式',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_by` bigint(0) NULL DEFAULT NULL COMMENT '更新人ID',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` int(0) NULL DEFAULT 0 COMMENT '删除标记',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_project_id`(`project_id`) USING BTREE,
  INDEX `idx_workshop_id`(`workshop_id`) USING BTREE,
  INDEX `idx_process_id`(`process_id`) USING BTREE,
  INDEX `idx_deleted`(`deleted`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '设备表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_device_research
-- ----------------------------
DROP TABLE IF EXISTS `t_device_research`;
CREATE TABLE `t_device_research`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` bigint(0) NULL DEFAULT NULL COMMENT '所属项目ID',
  `device_type_id` bigint(0) NULL DEFAULT NULL COMMENT '设备类型',
  `workshop_id` bigint(0) NULL DEFAULT NULL COMMENT '所属车间',
  `quantity` int(0) NULL DEFAULT 1 COMMENT '数量',
  `device_manufacturer` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备厂商',
  `is_interface_occupied` tinyint(1) NULL DEFAULT NULL COMMENT '控制器接口是否被占用',
  `interface_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '控制器接口类型',
  `has_touch_screen` tinyint(1) NULL DEFAULT NULL COMMENT '是否连接触摸屏',
  `controller_brand` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '控制器品牌',
  `controller_model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '控制器型号',
  `touch_screen_brand` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '触摸屏品牌',
  `has_point_table` tinyint(1) NULL DEFAULT NULL COMMENT '是否提供点位表',
  `has_plc_source` tinyint(1) NULL DEFAULT NULL COMMENT '是否提供PLC源程序',
  `has_touch_screen_source` tinyint(1) NULL DEFAULT NULL COMMENT '是否提供触摸屏源程序',
  `controller_photos` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '控制器照片(JSON数组)',
  `controller_videos` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '控制器视频(JSON数组)',
  `touchscreen_photos` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '触摸屏照片(JSON数组)',
  `touchscreen_videos` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '触摸屏视频(JSON数组)',
  `cabinet_photos` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '控制柜照片(JSON数组)',
  `cabinet_videos` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '控制柜视频(JSON数组)',
  `collect_device_status` tinyint(1) NULL DEFAULT NULL COMMENT '采集设备状态',
  `collect_process_params` tinyint(1) NULL DEFAULT NULL COMMENT '采集工艺参数',
  `data_items` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '需采集数据项(JSON数组)',
  `data_items_detail` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '需采集数据项明细',
  `collect_production` tinyint(1) NULL DEFAULT NULL COMMENT '采集产量/节拍',
  `collect_energy` tinyint(1) NULL DEFAULT NULL COMMENT '采集能耗',
  `basic_completed` tinyint(1) NULL DEFAULT 0 COMMENT '基础信息是否完成',
  `controller_completed` tinyint(1) NULL DEFAULT 0 COMMENT '控制器信息是否完成',
  `collection_completed` tinyint(1) NULL DEFAULT 0 COMMENT '采集信息是否完成',
  `research_progress` int(0) NULL DEFAULT 0 COMMENT '调研进度(0-100)',
  `researcher_id` bigint(0) NULL DEFAULT NULL COMMENT '调研人员ID',
  `research_date` date NULL DEFAULT NULL COMMENT '调研日期',
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '备注',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_by` bigint(0) NULL DEFAULT NULL COMMENT '更新人ID',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` tinyint(0) NULL DEFAULT 0 COMMENT '删除标记(0=未删除,1=已删除)',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_project_id`(`project_id`) USING BTREE,
  INDEX `idx_workshop`(`workshop_id`) USING BTREE,
  INDEX `idx_device_type`(`device_type_id`) USING BTREE,
  INDEX `idx_created_at`(`created_at`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '设备调研表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_device_task
-- ----------------------------
DROP TABLE IF EXISTS `t_device_task`;
CREATE TABLE `t_device_task`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `device_id` bigint(0) NOT NULL COMMENT '设备ID',
  `project_id` bigint(0) NOT NULL COMMENT '项目ID',
  `manager_id` bigint(0) NULL DEFAULT NULL COMMENT '负责人ID',
  `participant_ids` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '参与人ID列表(逗号分隔)',
  `stage_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `task_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '任务唯一标识',
  `task_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '任务名称',
  `completed` tinyint(1) NULL DEFAULT 0 COMMENT '是否完成',
  `start_date` datetime(0) NULL DEFAULT NULL COMMENT '开始日期',
  `end_date` datetime(0) NULL DEFAULT NULL COMMENT '完成日期',
  `actual_start_date` date NULL DEFAULT NULL COMMENT '实际开始日期',
  `actual_end_date` date NULL DEFAULT NULL COMMENT '实际完成日期',
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '备注',
  `materials` json NULL COMMENT '任务资料，存储TaskMaterial数组',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_by` bigint(0) NULL DEFAULT NULL COMMENT '更新人ID',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` tinyint(0) NULL DEFAULT 0 COMMENT '删除标记（0=未删除，1=已删除）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_device_id`(`device_id`) USING BTREE,
  INDEX `idx_project_id`(`project_id`) USING BTREE,
  INDEX `idx_stage_key`(`stage_key`) USING BTREE,
  INDEX `idx_completed`(`completed`) USING BTREE,
  INDEX `idx_deleted`(`deleted`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 22 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '设备任务表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_device_type
-- ----------------------------
DROP TABLE IF EXISTS `t_device_type`;
CREATE TABLE `t_device_type`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` bigint(0) NULL DEFAULT NULL,
  `project_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '所属项目名称（冗余字段）',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '类型编码',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '类型名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '类型描述',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_by` bigint(0) NULL DEFAULT NULL COMMENT '更新人ID',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` int(0) NULL DEFAULT 0 COMMENT '删除标记（0=未删除，1=已删除）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_project_id`(`project_id`) USING BTREE,
  INDEX `idx_deleted`(`deleted`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '设备类型表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_issue
-- ----------------------------
DROP TABLE IF EXISTS `t_issue`;
CREATE TABLE `t_issue`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '问题编号',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '问题标题',
  `type` enum('device','plan','technical','resource','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'other' COMMENT '问题类型',
  `priority` enum('low','medium','high','urgent') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'medium' COMMENT '优先级',
  `status` enum('open','assigned','in_progress','resolved','closed','reopened') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'open' COMMENT '问题状态',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '问题描述',
  `project_id` bigint(0) NOT NULL COMMENT '所属项目ID',
  `device_id` bigint(0) NULL DEFAULT NULL COMMENT '关联设备ID',
  `reporter_id` bigint(0) NOT NULL COMMENT '报告人ID',
  `assignee_id` bigint(0) NULL DEFAULT NULL COMMENT '负责人ID',
  `cc_users` json NULL COMMENT '抄送人ID列表',
  `due_date` date NULL DEFAULT NULL COMMENT '预计解决时间',
  `resolved_at` datetime(0) NULL DEFAULT NULL COMMENT '实际解决时间',
  `closed_at` datetime(0) NULL DEFAULT NULL COMMENT '关闭时间',
  `closed_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '关闭原因',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_by` bigint(0) NULL DEFAULT NULL COMMENT '更新人ID',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `create_time` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `update_time` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` tinyint(1) NULL DEFAULT 0 COMMENT '删除标记（0=未删除，1=已删除）',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code`) USING BTREE,
  INDEX `idx_project_id`(`project_id`) USING BTREE,
  INDEX `idx_device_id`(`device_id`) USING BTREE,
  INDEX `idx_reporter_id`(`reporter_id`) USING BTREE,
  INDEX `idx_assignee_id`(`assignee_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_priority`(`priority`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '问题表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_issue_attachment
-- ----------------------------
DROP TABLE IF EXISTS `t_issue_attachment`;
CREATE TABLE `t_issue_attachment`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `issue_id` bigint(0) NOT NULL COMMENT '问题ID',
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文件名',
  `url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文件URL',
  `size` bigint(0) NULL DEFAULT NULL COMMENT '文件大小(字节)',
  `file_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '文件类型',
  `uploader_id` bigint(0) NOT NULL COMMENT '上传人ID',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_by` bigint(0) NULL DEFAULT NULL COMMENT '更新人ID',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` tinyint(0) NULL DEFAULT 0 COMMENT '删除标记',
  `upload_time` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '上传时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_issue_id`(`issue_id`) USING BTREE,
  CONSTRAINT `t_issue_attachment_ibfk_1` FOREIGN KEY (`issue_id`) REFERENCES `t_issue` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '问题附件表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_issue_comment
-- ----------------------------
DROP TABLE IF EXISTS `t_issue_comment`;
CREATE TABLE `t_issue_comment`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `issue_id` bigint(0) NOT NULL COMMENT '问题ID',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '评论内容',
  `author_id` bigint(0) NOT NULL COMMENT '评论人ID',
  `is_internal` tinyint(1) NULL DEFAULT 0 COMMENT '是否内部评论',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_by` bigint(0) NULL DEFAULT NULL COMMENT '更新人ID',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` tinyint(0) NULL DEFAULT 0 COMMENT '删除标记',
  `create_time` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_issue_id`(`issue_id`) USING BTREE,
  INDEX `idx_author_id`(`author_id`) USING BTREE,
  CONSTRAINT `t_issue_comment_ibfk_1` FOREIGN KEY (`issue_id`) REFERENCES `t_issue` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '问题评论表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_issue_status_history
-- ----------------------------
DROP TABLE IF EXISTS `t_issue_status_history`;
CREATE TABLE `t_issue_status_history`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `issue_id` bigint(0) NOT NULL COMMENT '问题ID',
  `from_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '变更前状态',
  `to_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '变更后状态',
  `operator_id` bigint(0) NOT NULL COMMENT '操作人ID',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '备注',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_by` bigint(0) NULL DEFAULT NULL COMMENT '更新人ID',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` tinyint(0) NULL DEFAULT 0 COMMENT '删除标记',
  `create_time` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_issue_id`(`issue_id`) USING BTREE,
  INDEX `idx_operator_id`(`operator_id`) USING BTREE,
  CONSTRAINT `t_issue_status_history_ibfk_1` FOREIGN KEY (`issue_id`) REFERENCES `t_issue` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '问题状态变更历史表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_permission
-- ----------------------------
DROP TABLE IF EXISTS `t_permission`;
CREATE TABLE `t_permission`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '权限ID',
  `code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '权限编码，如：project:create',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '权限名称',
  `type` enum('menu','button') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'button' COMMENT '权限类型：menu-菜单, button-按钮',
  `parent_id` bigint(0) NULL DEFAULT NULL COMMENT '父权限ID',
  `path` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '前端路由路径',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '权限描述',
  `sort_order` int(0) NULL DEFAULT 0 COMMENT '排序序号',
  `status` tinyint(0) NULL DEFAULT 1 COMMENT '状态：1启用 0禁用',
  `deleted` int(0) NULL DEFAULT 0 COMMENT '删除标记',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_by` bigint(0) NULL DEFAULT NULL COMMENT '更新人',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code`) USING BTREE,
  INDEX `idx_code`(`code`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id`) USING BTREE,
  INDEX `idx_type`(`type`) USING BTREE,
  INDEX `idx_deleted`(`deleted`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 23 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '权限表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_project
-- ----------------------------
DROP TABLE IF EXISTS `t_project`;
CREATE TABLE `t_project`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目名称',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目编号',
  `customer` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '客户名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '项目描述',
  `status` int(0) NULL DEFAULT 0 COMMENT '状态：0=待启动, 1=进行中, 2=已完成, 3=已取消',
  `start_date` date NULL DEFAULT NULL COMMENT '开始日期',
  `end_date` date NULL DEFAULT NULL COMMENT '结束日期',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_by` bigint(0) NULL DEFAULT NULL COMMENT '更新人ID',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` int(0) NULL DEFAULT 0 COMMENT '删除标记',
  `priority` int(0) NULL DEFAULT 1 COMMENT '优先级：0=低, 1=中, 2=高, 3=紧急',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code`) USING BTREE,
  INDEX `idx_code`(`code`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_deleted`(`deleted`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_project_plan
-- ----------------------------
DROP TABLE IF EXISTS `t_project_plan`;
CREATE TABLE `t_project_plan`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` bigint(0) NOT NULL COMMENT '项目ID',
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '计划名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '计划描述',
  `start_date` date NOT NULL COMMENT '计划开始日期',
  `end_date` date NOT NULL COMMENT '计划结束日期',
  `stages_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '阶段配置JSON',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '创建人',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '更新人',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` int(0) NULL DEFAULT 0 COMMENT '删除标记(0=未删除,1=已删除)',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '项目计划表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_project_task
-- ----------------------------
DROP TABLE IF EXISTS `t_project_task`;
CREATE TABLE `t_project_task`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` bigint(0) NOT NULL COMMENT '项目ID',
  `manager_id` bigint(0) NULL DEFAULT NULL COMMENT '负责人ID',
  `participant_ids` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '参与人ID列表(逗号分隔)',
  `stage_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `task_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '任务唯一标识',
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '任务名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '任务描述',
  `status` enum('pending','in_progress','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'pending' COMMENT '任务状态：pending=未开始, in_progress=进行中, completed=已完成, cancelled=已取消',
  `start_date` datetime(0) NULL DEFAULT NULL COMMENT '开始日期',
  `end_date` datetime(0) NULL DEFAULT NULL COMMENT '结束日期',
  `actual_start_date` date NULL DEFAULT NULL COMMENT '实际开始日期',
  `actual_end_date` date NULL DEFAULT NULL COMMENT '实际完成日期',
  `progress` int(0) NULL DEFAULT 0 COMMENT '完成进度0-100',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_by` bigint(0) NULL DEFAULT NULL COMMENT '更新人ID',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` tinyint(0) NULL DEFAULT 0 COMMENT '删除标记',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_project_id`(`project_id`) USING BTREE,
  INDEX `idx_stage_key`(`stage_key`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_deleted`(`deleted`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 55 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '项目任务表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_role
-- ----------------------------
DROP TABLE IF EXISTS `t_role`;
CREATE TABLE `t_role`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色名称',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色编码',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '角色描述',
  `is_system` int(0) NULL DEFAULT 0 COMMENT '是否系统预置：0=否, 1=是',
  `status` int(0) NULL DEFAULT 1 COMMENT '状态：0=禁用, 1=启用',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_by` bigint(0) NULL DEFAULT NULL COMMENT '更新人ID',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` int(0) NULL DEFAULT 0 COMMENT '删除标记',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code`) USING BTREE,
  INDEX `idx_code`(`code`) USING BTREE,
  INDEX `idx_deleted`(`deleted`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '角色表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_stage
-- ----------------------------
DROP TABLE IF EXISTS `t_stage`;
CREATE TABLE `t_stage`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '阶段ID',
  `key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '阶段名称',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '阶段描述',
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '图标',
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '显示颜色',
  `progress_mode` enum('by_task','by_device') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'by_device' COMMENT '推进方式',
  `is_system` int(0) NULL DEFAULT 0 COMMENT '是否系统预置',
  `default_weight` int(0) NULL DEFAULT 0 COMMENT '默认权重 0-100',
  `task_templates` json NULL COMMENT '任务模板数组（JSON）',
  `sort_order` int(0) NULL DEFAULT 0 COMMENT '排序序号',
  `status` tinyint(0) NULL DEFAULT 1 COMMENT '状态：1启用 0禁用',
  `deleted` int(0) NULL DEFAULT 0 COMMENT '删除标记',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_by` bigint(0) NULL DEFAULT NULL COMMENT '更新人',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `key`(`key`) USING BTREE,
  INDEX `idx_key`(`key`) USING BTREE,
  INDEX `idx_sort_order`(`sort_order`) USING BTREE,
  INDEX `idx_is_system`(`is_system`) USING BTREE,
  INDEX `idx_deleted`(`deleted`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目阶段表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_system_config
-- ----------------------------
DROP TABLE IF EXISTS `t_system_config`;
CREATE TABLE `t_system_config`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `config_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '配置键',
  `config_value` json NOT NULL COMMENT '配置值(JSON格式)',
  `config_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'STRING' COMMENT '配置类型: STRING, JSON, NUMBER',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '配置描述',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '配置分类',
  `is_system` tinyint(0) NOT NULL DEFAULT 0 COMMENT '是否系统配置: 0-否, 1-是',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人ID',
  `updated_by` bigint(0) NULL DEFAULT NULL COMMENT '更新人ID',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` tinyint(0) NOT NULL DEFAULT 0 COMMENT '删除标记: 0-未删除, 1-已删除',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_config_key`(`config_key`, `deleted`) USING BTREE,
  INDEX `idx_category`(`category`, `deleted`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '系统配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_user
-- ----------------------------
DROP TABLE IF EXISTS `t_user`;
CREATE TABLE `t_user`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '姓名',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '头像URL',
  `status` int(0) NULL DEFAULT 1 COMMENT '状态：0=禁用, 1=启用',
  `last_login_time` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '最后登录IP',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_by` bigint(0) NULL DEFAULT NULL COMMENT '更新人ID',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` int(0) NULL DEFAULT 0 COMMENT '删除标记（0=未删除，1=已删除）',
  `dingtalk_userid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '钉钉UserID（企业内唯一）',
  `dingtalk_unionid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '钉钉UnionID（全局唯一）',
  `dingtalk_dept_id_list` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '钉钉部门ID列表',
  `source` tinyint(0) NULL DEFAULT 0 COMMENT '用户来源：0=本地, 1=钉钉同步',
  `job_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '工号',
  `current_project_id` bigint(0) NULL DEFAULT NULL COMMENT '当前项目ID',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username`) USING BTREE,
  UNIQUE INDEX `uk_dingtalk_userid`(`dingtalk_userid`) USING BTREE,
  INDEX `idx_username`(`username`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_deleted`(`deleted`) USING BTREE,
  INDEX `idx_dingtalk_unionid`(`dingtalk_unionid`) USING BTREE,
  INDEX `idx_source`(`source`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_workshop
-- ----------------------------
DROP TABLE IF EXISTS `t_workshop`;
CREATE TABLE `t_workshop`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` bigint(0) NOT NULL COMMENT '所属项目ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '车间名称',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '车间编号',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '车间描述',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_by` bigint(0) NULL DEFAULT NULL COMMENT '更新人ID',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` int(0) NULL DEFAULT 0 COMMENT '删除标记',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_project_id`(`project_id`) USING BTREE,
  INDEX `idx_deleted`(`deleted`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '车间表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for t_project_member
-- ----------------------------
DROP TABLE IF EXISTS `t_project_member`;
CREATE TABLE `t_project_member`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` bigint(0) NOT NULL COMMENT '项目ID',
  `user_id` bigint(0) NOT NULL COMMENT '用户ID',
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEMBER' COMMENT '角色：MANAGER=项目经理, MEMBER=普通成员',
  `is_active` tinyint(0) NULL DEFAULT 1 COMMENT '是否有效：0=已退出, 1=有效',
  `joined_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '加入时间',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `created_by` bigint(0) NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_by` bigint(0) NULL DEFAULT NULL COMMENT '更新人ID',
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted` int(0) NULL DEFAULT 0 COMMENT '删除标记（0=未删除，1=已删除）',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_project_user`(`project_id`, `user_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_manager_lookup`(`user_id`, `role`) USING BTREE,
  INDEX `idx_project_role`(`project_id`, `role`) USING BTREE,
  INDEX `idx_deleted`(`deleted`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目-成员关系表（多对多）' ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
