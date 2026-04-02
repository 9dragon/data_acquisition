package com.dataacquisition.modules.dingtalk.service;

import com.dataacquisition.modules.dingtalk.dto.DingTalkAuthDto;
import com.dataacquisition.modules.dingtalk.dto.DingTalkUserInfoDto;
import com.dataacquisition.modules.system.entity.User;

import java.util.Map;

/**
 * 钉钉服务接口
 */
public interface DingTalkService {

    /**
     * 钉钉免登认证
     * 通过authCode获取用户信息并登录
     *
     * @param authDto 认证请求
     * @return JWT Token
     */
    String auth(DingTalkAuthDto authDto);

    /**
     * 钉钉免登认证（返回完整用户信息）
     *
     * @param authDto 认证请求
     * @return 包含token和用户信息的Map
     */
    Map<String, Object> authWithUserInfo(DingTalkAuthDto authDto);

    /**
     * 同步钉钉用户
     *
     * @return 同步的用户数量
     */
    int syncUsers();

    /**
     * 同步钉钉部门
     *
     * @return 同步的部门数量
     */
    int syncDepartments();

    /**
     * 获取钉钉access_token
     *
     * @return access_token
     */
    String getAccessToken();

    /**
     * 通过authCode获取钉钉userId
     *
     * @param authCode 授权码
     * @return 钉钉userId
     */
    String getUserIdByCode(String authCode);

    /**
     * 通过userId获取用户信息
     *
     * @param userId 钉钉userId
     * @return 用户信息
     */
    DingTalkUserInfoDto getUserInfo(String userId);

    /**
     * 同步单个钉钉用户到本地
     *
     * @param dingTalkUser 钉钉用户信息
     * @return 本地用户
     */
    User syncUser(DingTalkUserInfoDto dingTalkUser);
}
