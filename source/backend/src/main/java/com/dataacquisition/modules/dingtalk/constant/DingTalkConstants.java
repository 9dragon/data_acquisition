package com.dataacquisition.modules.dingtalk.constant;

/**
 * 钉钉常量
 */
public class DingTalkConstants {

    /**
     * 用户来源：本地
     */
    public static final int SOURCE_LOCAL = 0;

    /**
     * 用户来源：钉钉同步
     */
    public static final int SOURCE_DINGTALK = 1;

    /**
     * 钉钉API地址
     */
    public static final String DINGTALK_API_URL = "https://oapi.dingtalk.com";

    /**
     * 获取用户信息接口
     */
    public static final String GET_USER_INFO = "/topapi/v2/user/get";

    /**
     * 获取access_token接口
     */
    public static final String GET_ACCESS_TOKEN = "/gettoken";

    /**
     * 通过authCode获取用户信息
     */
    public static final String GET_USER_INFO_BY_CODE = "/topapi/v2/user/getuserinfo";

    /**
     * 获取部门列表
     */
    public static final String GET_DEPT_LIST = "/topapi/v2/department/listsub";

    /**
     * 获取部门用户
     */
    public static final String GET_DEPT_USER = "/topapi/v2/user/list";

    /**
     * 获取用户详情
     */
    public static final String GET_USER_DETAIL = "/topapi/v2/user/get";
}
