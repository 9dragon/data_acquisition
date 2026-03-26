-- 将密码改为明文 admin123（开发环境使用）
UPDATE t_user
SET password = 'admin123'
WHERE username = 'admin';

-- 验证更新结果
SELECT username, password, name, status
FROM t_user
WHERE username = 'admin';

SELECT 'Password updated to plaintext: admin123' AS message;
