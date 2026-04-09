package com.dataacquisition.service;

import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * MinIO文件服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucketName:data-acquisition}")
    private String bucketName;

    @Value("${minio.endpoint:}")
    private String endpoint;

    /**
     * 上传文件
     *
     * @param file 文件
     * @param path 路径前缀
     * @return 文件URL
     */
    public String upload(MultipartFile file, String path) {
        try {
            // 确保bucket存在
            ensureBucketExists();

            // 生成文件名
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String fileName = path + "/" + UUID.randomUUID() + extension;

            // 上传文件
            InputStream inputStream = file.getInputStream();
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(fileName)
                    .stream(inputStream, file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build()
            );

            return getFileUrl(fileName);
        } catch (Exception e) {
            log.error("文件上传失败", e);
            throw new RuntimeException("文件上传失败: " + e.getMessage());
        }
    }

    /**
     * 上传Base64图片
     *
     * @param base64Data Base64数据
     * @param path       路径前缀
     * @return 文件URL（带签名）
     */
    public String uploadBase64Image(String base64Data, String path) {
        // 同时返回路径，供导出使用
        return uploadBase64ImageAndReturnPath(base64Data, path).get("url");
    }

    /**
     * 上传Base64图片，返回路径和URL
     *
     * @param base64Data Base64数据
     * @param path       路径前缀
     * @return 包含 url 和 path 的 Map
     */
    public java.util.Map<String, String> uploadBase64ImageAndReturnPath(String base64Data, String path) {
        try {
            // 确保bucket存在
            ensureBucketExists();

            // 解析Base64
            String[] parts = base64Data.split(",");
            String imageData = parts[parts.length - 1];
            String header = parts.length > 1 ? parts[0] : "";

            // 解析文件类型
            String extension = ".jpg";
            if (header.contains("png")) {
                extension = ".png";
            } else if (header.contains("gif")) {
                extension = ".gif";
            } else if (header.contains("webp")) {
                extension = ".webp";
            }

            // 生成文件名（去掉前缀斜杠，保持与前端一致）
            String fileName = path + "/" + UUID.randomUUID() + extension;

            // 解码Base64
            byte[] bytes = Base64.getDecoder().decode(imageData);
            ByteArrayInputStream inputStream = new ByteArrayInputStream(bytes);

            // 上传文件
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(fileName)
                    .stream(inputStream, bytes.length, -1)
                    .contentType("image/jpeg")
                    .build()
            );

            java.util.Map<String, String> result = new java.util.HashMap<>();
            result.put("url", getFileUrl(fileName));
            result.put("path", fileName);
            return result;
        } catch (Exception e) {
            log.error("Base64图片上传失败", e);
            throw new RuntimeException("图片上传失败: " + e.getMessage());
        }
    }

    /**
     * 获取文件URL
     *
     * @param fileName 文件名
     * @return 文件URL
     */
    public String getFileUrl(String fileName) {
        try {
            // 生成7天有效的访问URL
            String url = minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(bucketName)
                    .object(fileName)
                    .expiry(7, TimeUnit.DAYS)
                    .build()
            );
            return url;
        } catch (Exception e) {
            log.error("获取文件URL失败", e);
            return endpoint + "/" + bucketName + "/" + fileName;
        }
    }

    /**
     * 删除文件
     *
     * @param fileUrl 文件URL
     */
    public void deleteFile(String fileUrl) {
        try {
            // 从URL中提取文件名
            String fileName = extractFileName(fileUrl);
            if (fileName == null) {
                return;
            }

            minioClient.removeObject(
                RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(fileName)
                    .build()
            );
        } catch (Exception e) {
            log.error("删除文件失败", e);
        }
    }

    /**
     * 确保bucket存在
     */
    private void ensureBucketExists() {
        try {
            boolean found = minioClient.bucketExists(
                BucketExistsArgs.builder()
                    .bucket(bucketName)
                    .build()
            );
            if (!found) {
                minioClient.makeBucket(
                    MakeBucketArgs.builder()
                        .bucket(bucketName)
                        .build()
                );
                log.info("创建MinIO bucket: {}", bucketName);
            }
        } catch (Exception e) {
            log.error("检查bucket失败", e);
            throw new RuntimeException("MinIO配置错误: " + e.getMessage());
        }
    }

    /**
     * 从URL中提取文件名
     */
    private String extractFileName(String fileUrl) {
        try {
            if (fileUrl.contains("/" + bucketName + "/")) {
                return fileUrl.substring(fileUrl.indexOf("/" + bucketName + "/") + bucketName.length() + 2);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 从存储中读取图片字节（绕过URL签名）
     *
     * @param objectPath 对象路径，如 attendance/xxx.jpg
     * @return 图片字节数组
     */
    public byte[] getImageBytes(String objectPath) {
        try {
            GetObjectArgs args = GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectPath)
                    .build();
            
            try (InputStream stream = minioClient.getObject(args);
                 ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = stream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
                return outputStream.toByteArray();
            }
        } catch (Exception e) {
            log.error("读取图片失败: {}", objectPath, e);
            return null;
        }
    }
}
