-- 为签到记录表添加图片路径字段（无签名，带水印，用于导出）
ALTER TABLE t_attendance_record 
ADD COLUMN photo_path VARCHAR(500) DEFAULT NULL COMMENT '签到照片路径（无签名，带水印，用于导出）';