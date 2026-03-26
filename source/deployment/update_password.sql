-- 更新管理员密码为 admin123
-- BCrypt hash (10 rounds)
UPDATE t_user
SET password = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'
WHERE username = 'admin';

-- 验证更新结果
SELECT username, name, status,
       CASE
         WHEN password = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'
         THEN 'Password updated to admin123'
         ELSE 'Password not updated'
       END AS status
FROM t_user
WHERE username = 'admin';
