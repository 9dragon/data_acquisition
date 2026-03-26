package com.dataacquisition;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 应用启动类
 */
@SpringBootApplication
@MapperScan("com.dataacquisition.modules.*.mapper")
public class DataAcquisitionApplication {

    public static void main(String[] args) {
        SpringApplication.run(DataAcquisitionApplication.class, args);
        System.out.println("""
                ========================================
                   工业数据采集项目管理系统启动成功!
                   API文档地址: http://localhost:8080/api/doc.html
                ========================================
                """);
    }
}
