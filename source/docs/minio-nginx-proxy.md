# MinIO 反向代理配置注意事项

## 背景

后端使用内部地址（如 `http://minio:9000`）生成预签名URL，然后通过字符串替换为公开地址（如 `https://pm.anosi.cn/minio`）。
预签名URL的签名包含 host 和 path，因此 Nginx 反向代理配置必须满足以下两点：

1. **`proxy_pass` 末尾必须加 `/`** — 去掉路径前缀，确保 MinIO 收到正确的路径
2. **`Host` 头必须与后端内部 endpoint 一致** — 确保签名验证通过

## 正确配置示例

```nginx
location /minio/ {
    proxy_set_header Host minio:9000;        # 必须与 MINIO_ENDPOINT 的 host 一致
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://10.1.1.154:9000/;      # 末尾的 / 不能省略
}
```

## 常见错误

- `proxy_pass` 缺少末尾 `/` → MinIO 收到 `/minio/data-acquisition/...` 导致 bucket 解析为 `minio`
- `Host` 设为 `$http_host` → 签名中的 host 是内部域名，但请求到达时 host 变为外部域名，签名校验失败
- 重复设置 `proxy_set_header Host` → 后面的会覆盖前面的
