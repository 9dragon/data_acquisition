package com.dataacquisition.modules.dingtalk.service.impl;

import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.config.JwtConfig;
import com.dataacquisition.modules.dingtalk.config.DingTalkConfig;
import com.dataacquisition.modules.dingtalk.constant.DingTalkConstants;
import com.dataacquisition.modules.dingtalk.dto.DingTalkAuthDto;
import com.dataacquisition.modules.dingtalk.dto.DingTalkUserInfoDto;
import com.dataacquisition.modules.dingtalk.service.DingTalkService;
import com.dataacquisition.modules.system.entity.User;
import com.dataacquisition.modules.system.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * 钉钉服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DingTalkServiceImpl implements DingTalkService {

    private final DingTalkConfig dingTalkConfig;
    private final UserService userService;
    private final JwtConfig jwtConfig;
    private final StringRedisTemplate redisTemplate;
    private final PasswordEncoder passwordEncoder;

    private static final String ACCESS_TOKEN_CACHE_KEY = "dingtalk:access_token";
    private static final long ACCESS_TOKEN_CACHE_EXPIRE = 7200; // 2小时
    private static final String JSAPI_TICKET_CACHE_KEY = "dingtalk:jsapi_ticket";
    private static final long JSAPI_TICKET_CACHE_EXPIRE = 7200; // 2小时

    @Override
    public String auth(DingTalkAuthDto authDto) {
        // 1. 通过authCode获取钉钉userId
        String userId = getUserIdByCode(authDto.getAuthCode());
        if (userId == null) {
            throw new RuntimeException("获取钉钉用户信息失败");
        }

        // 2. 获取用户详细信息
        DingTalkUserInfoDto dingTalkUser = getUserInfo(userId);
        if (dingTalkUser == null) {
            throw new RuntimeException("获取钉钉用户详情失败");
        }

        // 3. 同步用户到本地
        User user = syncUser(dingTalkUser);

        // 4. 生成JWT Token
        String token = jwtConfig.generateToken(user.getId(), user.getUsername());

        log.info("钉钉用户免登成功: userId={}, username={}", userId, user.getUsername());
        return token;
    }

    @Override
    public Map<String, Object> authWithUserInfo(DingTalkAuthDto authDto) {
        // 1. 通过authCode获取钉钉userId
        String userId = getUserIdByCode(authDto.getAuthCode());
        if (userId == null) {
            throw new RuntimeException("获取钉钉用户信息失败");
        }

        // 2. 获取用户详细信息
        DingTalkUserInfoDto dingTalkUser = getUserInfo(userId);
        if (dingTalkUser == null) {
            throw new RuntimeException("获取钉钉用户详情失败");
        }

        // 3. 同步用户到本地
        User user = syncUser(dingTalkUser);

        // 4. 生成JWT Token
        String token = jwtConfig.generateToken(user.getId(), user.getUsername());

        // 5. 构建返回数据
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("username", user.getUsername());
        userInfo.put("name", user.getName());
        userInfo.put("avatar", user.getAvatar());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", userInfo);

        log.info("钉钉用户免登成功: userId={}, username={}", userId, user.getUsername());
        return result;
    }

    @Override
    public int syncUsers() {
        log.info("开始同步钉钉用户...");
        int count = 0;
        // TODO: 实现批量同步逻辑
        log.info("钉钉用户同步完成，同步数量: {}", count);
        return count;
    }

    @Override
    public int syncDepartments() {
        log.info("开始同步钉钉部门...");
        int count = 0;
        // TODO: 实现批量同步逻辑
        log.info("钉钉部门同步完成，同步数量: {}", count);
        return count;
    }

    @Override
    public String getAccessToken() {
        // 先从缓存获取
        String cachedToken = redisTemplate.opsForValue().get(ACCESS_TOKEN_CACHE_KEY);
        if (cachedToken != null) {
            log.info("使用缓存的access_token");
            return cachedToken;
        }

        // 调用钉钉API获取access_token
        String url = DingTalkConstants.DINGTALK_API_URL + DingTalkConstants.GET_ACCESS_TOKEN;
        Map<String, Object> params = new HashMap<>();
        params.put("appkey", dingTalkConfig.getAppKey());
        params.put("appsecret", dingTalkConfig.getAppSecret());

        log.info("获取钉钉access_token: appKey={}", dingTalkConfig.getAppKey());

        String response = HttpUtil.get(url, params);
        JSONObject json = JSONUtil.parseObj(response);

        log.info("钉钉API响应 - 获取access_token: errcode={}, errmsg={}",
            json.getInt("errcode"), json.getStr("errmsg"));

        if (json.getInt("errcode") == 0) {
            String accessToken = json.getStr("access_token");
            // 缓存access_token
            redisTemplate.opsForValue().set(ACCESS_TOKEN_CACHE_KEY, accessToken,
                ACCESS_TOKEN_CACHE_EXPIRE, TimeUnit.SECONDS);
            log.info("成功获取并缓存access_token");
            return accessToken;
        }

        log.error("获取钉钉access_token失败: errcode={}, errmsg={}",
            json.getInt("errcode"), json.getStr("errmsg"));
        throw new RuntimeException("获取钉钉access_token失败: " + json.getStr("errmsg"));
    }

    @Override
    public String getUserIdByCode(String authCode) {
        String accessToken = getAccessToken();
        String url = DingTalkConstants.DINGTALK_API_URL + DingTalkConstants.GET_USER_INFO_BY_CODE;

        Map<String, Object> params = new HashMap<>();
        params.put("access_token", accessToken);
        params.put("code", authCode);

        String response = HttpUtil.get(url, params);
        JSONObject json = JSONUtil.parseObj(response);

        log.info("钉钉API响应 - 通过authCode获取userId: code={}, errcode={}, errmsg={}, response={}",
            authCode, json.getInt("errcode"), json.getStr("errmsg"), response);

        if (json.getInt("errcode") == 0) {
            // userid在result对象中
            JSONObject result = json.getJSONObject("result");
            return result.getStr("userid");
        }

        log.error("通过authCode获取userId失败: errcode={}, errmsg={}", json.getInt("errcode"), json.getStr("errmsg"));
        return null;
    }

    @Override
    public DingTalkUserInfoDto getUserInfo(String userId) {
        String accessToken = getAccessToken();
        String url = DingTalkConstants.DINGTALK_API_URL + DingTalkConstants.GET_USER_DETAIL;

        Map<String, Object> params = new HashMap<>();
        params.put("access_token", accessToken);
        params.put("userid", userId);

        String response = HttpUtil.get(url, params);
        JSONObject json = JSONUtil.parseObj(response);

        if (json.getInt("errcode") == 0) {
            JSONObject result = json.getJSONObject("result");
            return JSONUtil.toBean(result, DingTalkUserInfoDto.class);
        }

        log.error("获取用户详情失败: {}", json.getStr("errmsg"));
        return null;
    }

    @Override
    public User syncUser(DingTalkUserInfoDto dingTalkUser) {
        // 1. 先通过dingtalkUserid查找本地用户
        User localUser = userService.lambdaQuery()
            .eq(User::getDingtalkUserid, dingTalkUser.getUserid())
            .one();

        if (localUser != null) {
            // 更新用户信息
            updateUserFromDingTalk(localUser, dingTalkUser);
            userService.updateById(localUser);
            return localUser;
        }

        // 2. 通过unionid查找
        if (dingTalkUser.getUnionid() != null) {
            localUser = userService.lambdaQuery()
                .eq(User::getDingtalkUnionid, dingTalkUser.getUnionid())
                .one();
            if (localUser != null) {
                updateUserFromDingTalk(localUser, dingTalkUser);
                userService.updateById(localUser);
                return localUser;
            }
        }

        // 3. 通过手机号查找
        if (dingTalkUser.getMobile() != null) {
            localUser = userService.lambdaQuery()
                .eq(User::getPhone, dingTalkUser.getMobile())
                .one();
            if (localUser != null) {
                // 绑定钉钉账号
                localUser.setDingtalkUserid(dingTalkUser.getUserid());
                localUser.setDingtalkUnionid(dingTalkUser.getUnionid());
                updateUserFromDingTalk(localUser, dingTalkUser);
                userService.updateById(localUser);
                return localUser;
            }
        }

        // 4. 创建新用户
        localUser = new User();
        localUser.setUsername(dingTalkUser.getMobile());
        localUser.setPassword(passwordEncoder.encode(dingTalkConfig.getDefaultPassword()));
        updateUserFromDingTalk(localUser, dingTalkUser);
        localUser.setSource(DingTalkConstants.SOURCE_DINGTALK);
        localUser.setStatus(1); // 默认启用
        userService.save(localUser);

        return localUser;
    }

    /**
     * 从钉钉用户信息更新本地用户
     */
    private void updateUserFromDingTalk(User user, DingTalkUserInfoDto dingTalkUser) {
        user.setName(dingTalkUser.getName());
        user.setAvatar(dingTalkUser.getAvatar());
        user.setPhone(dingTalkUser.getMobile());
        user.setEmail(dingTalkUser.getEmail());
        user.setDingtalkUserid(dingTalkUser.getUserid());
        user.setDingtalkUnionid(dingTalkUser.getUnionid());
        user.setJobNumber(dingTalkUser.getJobNumber());

        // 部门ID列表
        if (dingTalkUser.getDeptIdList() != null && !dingTalkUser.getDeptIdList().isEmpty()) {
            user.setDingtalkDeptIdList(String.join(",",
                dingTalkUser.getDeptIdList().stream()
                    .map(String::valueOf)
                    .toArray(String[]::new)));
        }
    }

    @Override
    public Map<String, String> getJsApiSignature(String url) {
        // 1. 获取jsapi_ticket
        String ticket = getJsApiTicket();

        // 2. 生成随机字符串
        String nonceStr = UUID.randomUUID().toString().replace("-", "");

        // 3. 生成时间戳
        long timeStamp = System.currentTimeMillis() / 1000;

        // 4. 生成签名
        String signature = generateSignature(ticket, nonceStr, timeStamp, url);

        // 5. 返回配置信息
        Map<String, String> config = new HashMap<>();
        config.put("corpId", dingTalkConfig.getCorpId());
        config.put("agentId", dingTalkConfig.getAgentId());
        config.put("timeStamp", String.valueOf(timeStamp));
        config.put("nonceStr", nonceStr);
        config.put("signature", signature);

        log.info("生成JSAPI签名配置: url={}, signature={}", url, signature);
        return config;
    }

    /**
     * 获取jsapi_ticket
     */
    private String getJsApiTicket() {
        // 先从缓存获取
        String cachedTicket = redisTemplate.opsForValue().get(JSAPI_TICKET_CACHE_KEY);
        if (cachedTicket != null) {
            log.info("使用缓存的jsapi_ticket");
            return cachedTicket;
        }

        // 调用钉钉API获取jsapi_ticket
        String accessToken = getAccessToken();
        String url = DingTalkConstants.DINGTALK_API_URL + "/get_jsapi_ticket";

        Map<String, Object> params = new HashMap<>();
        params.put("access_token", accessToken);
        params.put("type", "jsapi");

        log.info("获取钉钉jsapi_ticket");

        String response = HttpUtil.get(url, params);
        JSONObject json = JSONUtil.parseObj(response);

        log.info("钉钉API响应 - 获取jsapi_ticket: errcode={}, errmsg={}",
            json.getInt("errcode"), json.getStr("errmsg"));

        if (json.getInt("errcode") == 0) {
            String ticket = json.getStr("ticket");
            // 缓存jsapi_ticket
            redisTemplate.opsForValue().set(JSAPI_TICKET_CACHE_KEY, ticket,
                JSAPI_TICKET_CACHE_EXPIRE, TimeUnit.SECONDS);
            log.info("成功获取并缓存jsapi_ticket");
            return ticket;
        }

        log.error("获取钉钉jsapi_ticket失败: errcode={}, errmsg={}",
            json.getInt("errcode"), json.getStr("errmsg"));
        throw new RuntimeException("获取钉钉jsapi_ticket失败: " + json.getStr("errmsg"));
    }

    /**
     * 生成签名
     * signature = sha1(stringToSign)
     * stringToSign = "jsapi_ticket=" + ticket + "&noncestr=" + nonceStr + "&timestamp=" + timeStamp + "&url=" + url
     */
    private String generateSignature(String ticket, String nonceStr, long timeStamp, String url) {
        String stringToSign = "jsapi_ticket=" + ticket +
            "&noncestr=" + nonceStr +
            "&timestamp=" + timeStamp +
            "&url=" + url;

        log.debug("签名字符串: {}", stringToSign);

        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] digest = md.digest(stringToSign.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexStr = new StringBuilder();
            for (byte b : digest) {
                String shaHex = Integer.toHexString(b & 0xFF);
                if (shaHex.length() < 2) {
                    hexStr.append(0);
                }
                hexStr.append(shaHex);
            }

            return hexStr.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error("生成签名失败", e);
            throw new RuntimeException("生成签名失败", e);
        }
    }
}
