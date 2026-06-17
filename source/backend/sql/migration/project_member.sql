-- =====================================================
-- 项目-成员关系表迁移脚本
-- 用途：支持项目经理在移动端实时查看组员签到情况
-- 说明：新建多对多关系表 t_project_member，并按 t_project.manager_name
--       回填历史项目经理数据（按姓名匹配 t_user.name，重名跳过）
-- 执行方式：在远程 MySQL 手动执行
-- =====================================================

-- 1. 创建项目-成员关系表
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

-- 2. 回填历史项目经理数据
--    按 t_project.manager_name 匹配 t_user.name；
--    仅当姓名在 t_user 中唯一时才回填，重名或未匹配的留空待人工补录。
INSERT INTO `t_project_member` (`project_id`, `user_id`, `role`, `is_active`, `joined_at`, `created_at`, `deleted`)
SELECT p.id, u.id, 'MANAGER', 1, NOW(), NOW(), 0
FROM `t_project` p
INNER JOIN `t_user` u ON u.`name` = p.`manager_name` AND u.`deleted` = 0
WHERE p.`deleted` = 0
  AND p.`manager_name` IS NOT NULL
  AND p.`manager_name` <> ''
  -- 仅当姓名在用户表中唯一时回填（避免重名错配）
  AND (
    SELECT COUNT(1) FROM `t_user` u2
    WHERE u2.`name` = p.`manager_name` AND u2.`deleted` = 0
  ) = 1
  -- 避免重复插入
  AND NOT EXISTS (
    SELECT 1 FROM `t_project_member` pm
    WHERE pm.`project_id` = p.id AND pm.`user_id` = u.id AND pm.`deleted` = 0
  );

-- 3. 输出待人工补录的项目清单（重名或未匹配）
--    执行以下查询查看，再到后台界面手动指派
-- SELECT p.id, p.name, p.manager_name
-- FROM t_project p
-- LEFT JOIN t_project_member pm ON pm.project_id = p.id AND pm.role = 'MANAGER' AND pm.deleted = 0
-- WHERE p.deleted = 0 AND p.manager_name IS NOT NULL AND p.manager_name <> '' AND pm.id IS NULL;
