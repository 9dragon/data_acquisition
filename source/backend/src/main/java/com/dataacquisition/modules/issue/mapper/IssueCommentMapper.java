package com.dataacquisition.modules.issue.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dataacquisition.modules.issue.entity.IssueComment;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface IssueCommentMapper extends BaseMapper<IssueComment> {

    List<IssueComment> selectByIssueId(@Param("issueId") Long issueId);
}
