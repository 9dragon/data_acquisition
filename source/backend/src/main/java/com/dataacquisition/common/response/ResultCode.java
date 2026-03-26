package com.dataacquisition.common.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 响应码枚举
 */
@Getter
@AllArgsConstructor
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    ERROR(500, "操作失败"),

    // 客户端错误 4xx
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未授权，请先登录"),
    FORBIDDEN(403, "无权访问"),
    NOT_FOUND(404, "资源不存在"),
    METHOD_NOT_ALLOWED(405, "请求方法不支持"),
    CONFLICT(409, "资源冲突"),

    // 服务器错误 5xx
    INTERNAL_SERVER_ERROR(500, "服务器内部错误"),
    SERVICE_UNAVAILABLE(503, "服务暂不可用"),

    // 业务错误码 1xxx
    USER_NOT_FOUND(1001, "用户不存在"),
    USER_PASSWORD_ERROR(1002, "用户名或密码错误"),
    USER_ACCOUNT_DISABLED(1003, "账户已被禁用"),
    TOKEN_INVALID(1004, "Token无效或已过期"),
    TOKEN_EXPIRED(1005, "Token已过期"),

    PROJECT_NOT_FOUND(2001, "项目不存在"),
    PROJECT_NAME_EXISTS(2002, "项目名称已存在"),

    DEVICE_NOT_FOUND(3001, "设备不存在"),
    DEVICE_CODE_EXISTS(3002, "设备编码已存在"),

    PROCESS_NOT_FOUND(4001, "工序不存在"),

    WORKSHOP_NOT_FOUND(5001, "车间不存在"),

    TASK_NOT_FOUND(6001, "任务不存在"),

    FILE_UPLOAD_ERROR(7001, "文件上传失败"),
    FILE_TYPE_NOT_ALLOWED(7002, "文件类型不允许"),
    FILE_SIZE_EXCEEDED(7003, "文件大小超出限制");

    private final Integer code;
    private final String message;
}
