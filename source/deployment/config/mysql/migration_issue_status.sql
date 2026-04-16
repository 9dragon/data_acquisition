-- ============================================
-- 问题状态流转重构 - 数据迁移SQL
-- 执行前请备份 t_issue 和 t_issue_status_history 表
-- ============================================

-- 1. 存量数据迁移：assigned → open
UPDATE t_issue SET status = 'open' WHERE status = 'assigned';

-- 2. 存量数据迁移：reopened → in_progress
UPDATE t_issue SET status = 'in_progress' WHERE status = 'reopened';

-- 3. 状态历史记录迁移
UPDATE t_issue_status_history SET from_status = 'open' WHERE from_status = 'assigned';
UPDATE t_issue_status_history SET to_status = 'open' WHERE to_status = 'assigned';
UPDATE t_issue_status_history SET from_status = 'in_progress' WHERE from_status = 'reopened';
UPDATE t_issue_status_history SET to_status = 'in_progress' WHERE to_status = 'reopened';

-- 4. 修改 enum 定义，去掉 assigned 和 reopened
ALTER TABLE t_issue MODIFY COLUMN `status`
  enum('open','in_progress','resolved','closed')
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci
  NULL DEFAULT 'open' COMMENT '问题状态';
