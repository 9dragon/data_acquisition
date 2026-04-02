package com.dataacquisition.modules.issue.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.modules.issue.dto.IssueCreateDTO;
import com.dataacquisition.modules.issue.dto.IssueQueryDTO;
import com.dataacquisition.modules.issue.entity.Issue;
import com.dataacquisition.modules.issue.entity.IssueComment;
import com.dataacquisition.modules.issue.entity.IssueStatusHistory;

import java.util.List;
import java.util.Map;

public interface IssueService {

    Page<Issue> pageIssues(IssueQueryDTO query);

    Issue getById(Long id);

    Issue create(IssueCreateDTO dto, Long reporterId);

    Issue update(Issue issue);

    boolean delete(Long id);

    Issue assign(Long id, Long assigneeId, Long operatorId);

    Issue updateStatus(Long id, String status, Long operatorId, String remark);

    IssueComment addComment(Long issueId, String content, Long authorId, Boolean isInternal);

    List<IssueComment> getComments(Long issueId);

    List<IssueStatusHistory> getStatusHistory(Long issueId);

    List<Issue> getMyTodo(Long userId);

    List<Issue> getMyReported(Long userId);

    List<Issue> getMyCc(Long userId);

    Map<String, Object> getStats();
}
