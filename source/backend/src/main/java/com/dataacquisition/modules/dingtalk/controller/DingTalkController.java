package com.dataacquisition.modules.dingtalk.controller;

import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.dingtalk.dto.DingTalkAuthDto;
import com.dataacquisition.modules.dingtalk.service.DingTalkService;
import com.dataacquisition.modules.system.entity.User;
import com.dataacquisition.modules.system.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 钉钉控制器
 */
@Tag(name = "钉钉集成", description = "钉钉相关接口")
@RestController
@RequestMapping("/dingtalk")
@RequiredArgsConstructor
public class DingTalkController {

    private final DingTalkService dingTalkService;
    private final UserService userService;

    /**
     * 钉钉免登认证
     */
    @Operation(summary = "钉钉免登认证")
    @PostMapping("/auth")
    public Result<Map<String, Object>> auth(@Valid @RequestBody DingTalkAuthDto authDto) {
        // 进行钉钉免登认证，返回token和用户信息
        Map<String, Object> result = dingTalkService.authWithUserInfo(authDto);
        return Result.success(result);
    }

    /**
     * 同步钉钉用户
     */
    @Operation(summary = "同步钉钉用户")
    @PostMapping("/sync-users")
    public Result<Integer> syncUsers() {
        int count = dingTalkService.syncUsers();
        return Result.success(count);
    }

    /**
     * 同步钉钉部门
     */
    @Operation(summary = "同步钉钉部门")
    @PostMapping("/sync-depts")
    public Result<Integer> syncDepartments() {
        int count = dingTalkService.syncDepartments();
        return Result.success(count);
    }
}
