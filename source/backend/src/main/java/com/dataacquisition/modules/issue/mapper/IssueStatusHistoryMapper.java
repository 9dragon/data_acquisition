package com.dataacquisition.modules.issue.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dataacquisition.modules.issue.entity.IssueStatusHistory;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface IssueStatusHistoryMapper extends BaseMapper<IssueStatusHistory> {

    List<IssueStatusHistory> selectByIssueId(@Param("issueId") Long issueId);
}
