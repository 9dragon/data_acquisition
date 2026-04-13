FROM eclipse-temurin:17-jre

LABEL maintainer="support@example.com"

WORKDIR /app

# 复制Maven构建产物
COPY target/*.jar app.jar

# 暴露端口
EXPOSE 8080

# JVM参数
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"

# 启动应用
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
