package com.dataacquisition.common.constant;

/**
 * 通用常量
 */
public class Constant {

    /**
     * UTF-8编码
     */
    public static final String UTF8 = "UTF-8";

    /**
     * 默认页码
     */
    public static final Integer DEFAULT_PAGE_NUM = 1;

    /**
     * 默认每页条数
     */
    public static final Integer DEFAULT_PAGE_SIZE = 10;

    /**
     * 最大每页条数
     */
    public static final Integer MAX_PAGE_SIZE = 100;

    /**
     * Redis Key前缀
     */
    public static final String REDIS_KEY_PREFIX = "data-acquisition:";

    /**
     * Token Key
     */
    public static final String TOKEN_KEY = REDIS_KEY_PREFIX + "token:";

    /**
     * 用户信息Key
     */
    public static final String USER_INFO_KEY = REDIS_KEY_PREFIX + "user:";

    /**
     * 权限列表Key
     */
    public static final String PERMISSIONS_KEY = REDIS_KEY_PREFIX + "permissions:";
}
