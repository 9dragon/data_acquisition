package com.dataacquisition.modules.issue.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dataacquisition.modules.issue.dto.IssueQueryDTO;
import com.dataacquisition.modules.issue.entity.Issue;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface IssueMapper extends BaseMapper<Issue> {

    List<Issue> selectIssueList(@Param("query") IssueQueryDTO query);

    Long countIssueList(@Param("query") IssueQueryDTO query);
}
