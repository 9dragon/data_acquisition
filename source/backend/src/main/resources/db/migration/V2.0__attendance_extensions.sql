-- =====================================================
-- 移动端打卡功能扩展 - 数据库变更脚本
-- 版本: 2.0
-- 日期: 2026-04-07
-- =====================================================

-- 1. 创建系统配置表
CREATE TABLE IF NOT EXISTS `t_system_config` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
  `config_value` TEXT NOT NULL COMMENT '配置值(JSON格式)',
  `config_type` VARCHAR(20) NOT NULL DEFAULT 'STRING' COMMENT '配置类型: STRING, JSON, NUMBER',
  `description` VARCHAR(500) COMMENT '配置描述',
  `category` VARCHAR(50) COMMENT '配置分类',
  `is_system` TINYINT NOT NULL DEFAULT 0 COMMENT '是否系统配置: 0-否, 1-是',
  `created_by` BIGINT COMMENT '创建人ID',
  `updated_by` BIGINT COMMENT '更新人ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '删除标记: 0-未删除, 1-已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`, `deleted`),
  KEY `idx_category` (`category`, `deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 2. 扩展签到记录表
ALTER TABLE `t_attendance_record`
ADD COLUMN IF NOT EXISTS `shift_index` INT COMMENT '时段索引: 1-第一次, 2-第三次, ...',
ADD COLUMN IF NOT EXISTS `shift_name` VARCHAR(50) COMMENT '时段名称: 上班打卡、下班打卡等',
ADD COLUMN IF NOT EXISTS `is_late` TINYINT DEFAULT 0 COMMENT '是否迟到: 0-否, 1-是',
ADD COLUMN IF NOT EXISTS `original_photo_url` VARCHAR(500) COMMENT '原始照片URL(无水印)',
ADD COLUMN IF NOT EXISTS `watermark_photo_url` VARCHAR(500) COMMENT '带水印照片URL',
ADD INDEX IF NOT EXISTS `idx_user_date_shift` (`user_id`, `check_in_time`, `shift_index`);

-- 3. 初始化签到配置数据
INSERT INTO `t_system_config` (`config_key`, `config_value`, `config_type`, `description`, `category`, `is_system`) VALUES
('attendance.check_times', '{"dailyTimes": 3, "shifts": [{"name": "上班打卡", "startTime": "08:00", "endTime": "09:30", "lateTime": "09:00"}, {"name": "午间打卡", "startTime": "12:00", "endTime": "13:30", "lateTime": "13:00"}, {"name": "下班打卡", "startTime": "17:30", "endTime": "19:00", "lateTime": "18:00"}]}', 'JSON', '每日打卡次数及时段配置', 'attendance', 1)
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);

INSERT INTO `t_system_config` (`config_key`, `config_value`, `config_type`, `description`, `category`, `is_system`) VALUES
('attendance.watermark', '{"enabled": true, "position": "bottom_right", "fontSize": 16, "color": "#FFFFFF", "alpha": 0.8, "showTime": true, "showLocation": true, "showUser": true}', 'JSON', '图片水印配置', 'attendance', 1)
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);

-- 4. 数据迁移：为现有签到记录补充默认时段信息
UPDATE `t_attendance_record`
SET `shift_index` = 1,
    `shift_name` = '上班打卡',
    `is_late` = IF(`status` = 'LATE', 1, 0)
WHERE `shift_index` IS NULL AND DATE(`check_in_time`) < CURDATE();
