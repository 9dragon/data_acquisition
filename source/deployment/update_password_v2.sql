-- 查看更新前的密码
SELECT username, LEFT(password, 60) as current_password FROM t_user WHERE username = 'admin';

-- 更新管理员密码为 admin123
-- 使用已知正确的 BCrypt hash
UPDATE t_user
SET password = '$2a$10$gSAhZrxMllrbgj/kkK9UceBPpChGWJA7SYIb1Mqo.n5aNLq1/oRrC'
WHERE username = 'admin';

-- 查看更新后的密码
SELECT username, LEFT(password, 60) as new_password, updated_at FROM t_user WHERE username = 'admin';

-- 显示执行结果
SELECT 'Password update completed!' AS message,
       'Username: admin' AS username,
       'Password: admin123' AS password;
