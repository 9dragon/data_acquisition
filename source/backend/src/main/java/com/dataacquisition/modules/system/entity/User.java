package com.dataacquisition.modules.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.dataacquisition.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 用户实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_user")
public class User extends BaseEntity {

    /**
     * 主键
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户名
     */
    private String username;

    /**
     * 密码
     */
    private String password;

    /**
     * 姓名
     */
    private String name;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 公司
     */
    private String company;

    /**
     * 头像URL
     */
    private String avatar;

    /**
     * 状态：0=禁用, 1=启用
     */
    private Integer status;

    /**
     * 最后登录时间
     */
    private String lastLoginTime;

    /**
     * 最后登录IP
     */
    private String lastLoginIp;

    /**
     * 钉钉UserID（企业内唯一）
     */
    @TableField("dingtalk_userid")
    private String dingtalkUserid;

    /**
     * 钉钉UnionID（全局唯一）
     */
    @TableField("dingtalk_unionid")
    private String dingtalkUnionid;

    /**
     * 钉钉部门ID列表
     */
    @TableField("dingtalk_dept_id_list")
    private String dingtalkDeptIdList;

    /**
     * 用户来源：0=本地, 1=钉钉同步
     */
    @TableField("source")
    private Integer source;

    /**
     * 工号
     */
    @TableField("job_number")
    private String jobNumber;

    /**
     * 当前项目ID
     */
    @TableField("current_project_id")
    private Long currentProjectId;
}
