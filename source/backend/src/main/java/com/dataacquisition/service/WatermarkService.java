package com.dataacquisition.service;

import cn.hutool.core.img.Img;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HttpUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

/**
 * 水印处理服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WatermarkService {

    private final MinioService minioService;

    /**
     * 为图片添加水印
     *
     * @param imageUrl 原始图片URL
     * @param info     水印信息
     * @return 处理后的图片URL
     */
    public String addWatermark(String imageUrl, WatermarkInfo info) {
        try {
            // 1. 下载原始图片
            BufferedImage originalImage = downloadImage(imageUrl);
            if (originalImage == null) {
                log.warn("下载图片失败: {}", imageUrl);
                return imageUrl;
            }

            // 2. 添加水印
            BufferedImage watermarked = processWatermark(originalImage, info);

            // 3. 上传到MinIO
            return uploadWatermarkedImage(watermarked, info);

        } catch (Exception e) {
            log.error("添加水印失败", e);
            return imageUrl;
        }
    }

    /**
     * 下载图片
     */
    private BufferedImage downloadImage(String imageUrl) {
        try {
            // 从MinIO URL下载图片
            byte[] bytes = HttpUtil.downloadBytes(imageUrl);
            return ImageIO.read(new ByteArrayInputStream(bytes));
        } catch (Exception e) {
            log.error("下载图片失败: {}", imageUrl, e);
            return null;
        }
    }

    /**
     * 处理水印
     */
    private BufferedImage processWatermark(BufferedImage image, WatermarkInfo info) {
        // 创建Graphics2D对象
        Graphics2D g2d = image.createGraphics();

        // 设置抗锯齿
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        // 设置字体和颜色
        int fontSize = info.getFontSize() != null ? info.getFontSize() : 16;
        Font font = new Font("SimHei", Font.BOLD, fontSize);
        g2d.setFont(font);

        // 设置颜色（白色半透明）
        Color color = new Color(255, 255, 255, 200);
        if (StrUtil.isNotBlank(info.getColor())) {
            try {
                java.awt.Color c = java.awt.Color.decode(info.getColor());
                int alpha = info.getAlpha() != null ? (int) (info.getAlpha() * 255) : 200;
                color = new Color(c.getRed(), c.getGreen(), c.getBlue(), alpha);
            } catch (Exception e) {
                log.warn("解析颜色失败，使用默认白色", e);
            }
        }
        g2d.setColor(color);

        // 构建水印文本
        String watermarkText = buildWatermarkText(info);

        // 计算水印位置
        Point textPoint = calculatePosition(image, watermarkText, g2d.getFontMetrics(), info.getPosition());

        // 绘制半透明背景
        int padding = 10;
        java.awt.geom.Rectangle2D textBounds = g2d.getFontMetrics().getStringBounds(watermarkText, g2d);
        g2d.setColor(new Color(0, 0, 0, 100));
        g2d.fillRect(
            textPoint.x - padding,
            textPoint.y - padding - (int) textBounds.getHeight(),
            (int) textBounds.getWidth() + padding * 2,
            (int) textBounds.getHeight() + padding * 2
        );

        // 重新设置文字颜色
        g2d.setColor(color);

        // 绘制文字（多行）
        String[] lines = watermarkText.split("\n");
        int y = textPoint.y;
        for (String line : lines) {
            g2d.drawString(line, textPoint.x, y);
            y += g2d.getFontMetrics().getHeight();
        }

        g2d.dispose();
        return image;
    }

    /**
     * 构建水印文本
     */
    private String buildWatermarkText(WatermarkInfo info) {
        StringBuilder sb = new StringBuilder();

        if (info.isShowUser() && StrUtil.isNotBlank(info.getUserName())) {
            sb.append(info.getUserName()).append("\n");
        }

        if (info.isShowTime() && info.getTime() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            sb.append(info.getTime().format(formatter)).append("\n");
        }

        if (info.isShowLocation() && StrUtil.isNotBlank(info.getLocation())) {
            sb.append(info.getLocation());
        }

        return sb.toString();
    }

    /**
     * 计算水印位置
     */
    private Point calculatePosition(BufferedImage image, String text, FontMetrics metrics, String position) {
        int imageWidth = image.getWidth();
        int imageHeight = image.getHeight();

        // 计算文本总高度（多行）
        String[] lines = text.split("\n");
        int textHeight = lines.length * metrics.getHeight();
        int textWidth = 0;
        for (String line : lines) {
            int lineWidth = metrics.stringWidth(line);
            if (lineWidth > textWidth) {
                textWidth = lineWidth;
            }
        }

        int x, y;

        // 默认右下角
        if ("top_left".equals(position)) {
            x = 20;
            y = textHeight + 20;
        } else if ("top_right".equals(position)) {
            x = imageWidth - textWidth - 20;
            y = textHeight + 20;
        } else if ("bottom_left".equals(position)) {
            x = 20;
            y = imageHeight - 20;
        } else if ("center".equals(position)) {
            x = (imageWidth - textWidth) / 2;
            y = (imageHeight - textHeight) / 2 + textHeight;
        } else {
            // bottom_right (默认)
            x = imageWidth - textWidth - 20;
            y = imageHeight - 20;
        }

        return new Point(x, y);
    }

    /**
     * 上传带水印的图片
     */
    private String uploadWatermarkedImage(BufferedImage image, WatermarkInfo info) {
        try {
            // 转换为字节数组
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "jpg", baos);
            byte[] bytes = baos.toByteArray();

            // 转换为Base64
            String base64 = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(bytes);

            // 上传到MinIO
            return minioService.uploadBase64Image(base64, "attendance/watermarked");

        } catch (Exception e) {
            log.error("上传水印图片失败", e);
            throw new RuntimeException("上传水印图片失败");
        }
    }

    /**
     * 水印信息
     */
    @lombok.Data
    public static class WatermarkInfo {
        /**
         * 用户名
         */
        private String userName;

        /**
         * 时间
         */
        private LocalDateTime time;

        /**
         * 位置描述
         */
        private String location;

        /**
         * 字体大小
         */
        private Integer fontSize;

        /**
         * 颜色（如：#FFFFFF）
         */
        private String color;

        /**
         * 透明度（0-1）
         */
        private Double alpha;

        /**
         * 水印位置
         */
        private String position;

        /**
         * 是否显示用户信息
         */
        private boolean showUser = true;

        /**
         * 是否显示时间
         */
        private boolean showTime = true;

        /**
         * 是否显示位置
         */
        private boolean showLocation = true;
    }
}
