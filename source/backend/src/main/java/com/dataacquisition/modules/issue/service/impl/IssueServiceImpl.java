package com.dataacquisition.modules.issue.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.modules.issue.dto.IssueCreateDTO;
import com.dataacquisition.modules.issue.dto.IssueQueryDTO;
import com.dataacquisition.modules.issue.entity.Issue;
import com.dataacquisition.modules.issue.entity.IssueComment;
import com.dataacquisition.modules.issue.entity.IssueStatusHistory;
import com.dataacquisition.modules.issue.mapper.IssueCommentMapper;
import com.dataacquisition.modules.issue.mapper.IssueMapper;
import com.dataacquisition.modules.issue.mapper.IssueStatusHistoryMapper;
import com.dataacquisition.modules.issue.service.IssueService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class IssueServiceImpl implements IssueService {

    private final IssueMapper issueMapper;
    private final IssueCommentMapper commentMapper;
    private final IssueStatusHistoryMapper statusHistoryMapper;
    private final ObjectMapper objectMapper;

    private static final AtomicLong codeGenerator = new AtomicLong(System.currentTimeMillis() % 100000);

    @Override
    public Page<Issue> pageIssues(IssueQueryDTO query) {
        Page<Issue> page = new Page<>(query.getPageNum(), query.getPageSize());
        List<Issue> list = issueMapper.selectIssueList(query);
        Long total = issueMapper.countIssueList(query);
        page.setRecords(list);
        page.setTotal(total);
        return page;
    }

    @Override
    public Issue getById(Long id) {
        Issue issue = issueMapper.selectById(id);
        if (issue != null) {
            loadIssueRelations(issue);
        }
        return issue;
    }

    @Override
    @Transactional
    public Issue create(IssueCreateDTO dto, Long reporterId) {
        Issue issue = new Issue();
        issue.setCode(generateCode());
        issue.setTitle(dto.getTitle());
        issue.setType(dto.getType());
        issue.setPriority(dto.getPriority());
        issue.setStatus("open");
        issue.setDescription(dto.getDescription());
        issue.setProjectId(dto.getProjectId());
        issue.setDeviceId(dto.getDeviceId());
        issue.setReporterId(reporterId);
        issue.setAssigneeId(dto.getAssigneeId());
        issue.setDueDate(dto.getDueDate());

        if (dto.getCcUserIds() != null && !dto.getCcUserIds().isEmpty()) {
            try {
                issue.setCcUsers(objectMapper.writeValueAsString(dto.getCcUserIds()));
            } catch (JsonProcessingException e) {
                issue.setCcUsers("[]");
            }
        }

        issue.setCreatedBy(reporterId);
        issue.setUpdatedBy(reporterId);
        issueMapper.insert(issue);

        if (dto.getAssigneeId() != null) {
            updateStatus(issue.getId(), "assigned", reporterId, "创建问题并分配负责人");
        }

        return issue;
    }

    @Override
    @Transactional
    public Issue update(Issue issue) {
        Issue existing = issueMapper.selectById(issue.getId());
        if (existing == null) {
            throw new RuntimeException("问题不存在");
        }

        issue.setUpdatedAt(LocalDateTime.now());
        issueMapper.updateById(issue);

        return getById(issue.getId());
    }

    @Override
    @Transactional
    public boolean delete(Long id) {
        Issue issue = issueMapper.selectById(id);
        if (issue == null) {
            return false;
        }

        issueMapper.deleteById(id);
        return true;
    }

    @Override
    @Transactional
    public Issue assign(Long id, Long assigneeId, Long operatorId) {
        Issue issue = issueMapper.selectById(id);
        if (issue == null) {
            throw new RuntimeException("问题不存在");
        }

        String oldStatus = issue.getStatus();
        issue.setAssigneeId(assigneeId);
        
        if ("open".equals(oldStatus)) {
            issue.setStatus("assigned");
        }
        
        issue.setUpdatedAt(LocalDateTime.now());
        issueMapper.updateById(issue);

        addStatusHistory(id, oldStatus, "assigned", operatorId, "分配负责人");

        return getById(id);
    }

    @Override
    @Transactional
    public Issue updateStatus(Long id, String status, Long operatorId, String remark) {
        Issue issue = issueMapper.selectById(id);
        if (issue == null) {
            throw new RuntimeException("问题不存在");
        }

        String oldStatus = issue.getStatus();
        issue.setStatus(status);
        issue.setUpdatedAt(LocalDateTime.now());

        if ("resolved".equals(status)) {
            issue.setResolvedAt(LocalDateTime.now());
        } else if ("closed".equals(status)) {
            issue.setClosedAt(LocalDateTime.now());
        }

        issueMapper.updateById(issue);

        addStatusHistory(id, oldStatus, status, operatorId, remark);

        return getById(id);
    }

    @Override
    @Transactional
    public IssueComment addComment(Long issueId, String content, Long authorId, Boolean isInternal) {
        IssueComment comment = new IssueComment();
        comment.setIssueId(issueId);
        comment.setContent(content);
        comment.setAuthorId(authorId);
        comment.setIsInternal(isInternal != null && isInternal);
        comment.setCreatedBy(authorId);
        comment.setUpdatedBy(authorId);
        commentMapper.insert(comment);

        return comment;
    }

    @Override
    public List<IssueComment> getComments(Long issueId) {
        return commentMapper.selectByIssueId(issueId);
    }

    @Override
    public List<IssueStatusHistory> getStatusHistory(Long issueId) {
        return statusHistoryMapper.selectByIssueId(issueId);
    }

    @Override
    public List<Issue> getMyTodo(Long userId) {
        IssueQueryDTO query = new IssueQueryDTO();
        query.setAssigneeId(userId);
        query.setStatus("assigned");
        return issueMapper.selectIssueList(query);
    }

    @Override
    public List<Issue> getMyReported(Long userId) {
        IssueQueryDTO query = new IssueQueryDTO();
        query.setReporterId(userId);
        return issueMapper.selectIssueList(query);
    }

    @Override
    public List<Issue> getMyCc(Long userId) {
        IssueQueryDTO query = new IssueQueryDTO();
        List<Issue> allIssues = issueMapper.selectIssueList(query);
        return allIssues.stream()
                .filter(issue -> {
                    if (issue.getCcUsers() == null) return false;
                    try {
                        List<Long> ccIds = objectMapper.readValue(issue.getCcUsers(), new TypeReference<List<Long>>() {});
                        return ccIds.contains(userId);
                    } catch (JsonProcessingException e) {
                        return false;
                    }
                })
                .toList();
    }

    @Override
    public Map<String, Object> getStats() {
        IssueQueryDTO query = new IssueQueryDTO();
        query.setPageSize(Integer.MAX_VALUE);
        
        List<Issue> allIssues = issueMapper.selectIssueList(query);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", allIssues.size());
        
        long openCount = allIssues.stream().filter(i -> "open".equals(i.getStatus())).count();
        long assignedCount = allIssues.stream().filter(i -> "assigned".equals(i.getStatus())).count();
        long inProgressCount = allIssues.stream().filter(i -> "in_progress".equals(i.getStatus())).count();
        long resolvedCount = allIssues.stream().filter(i -> "resolved".equals(i.getStatus())).count();
        long closedCount = allIssues.stream().filter(i -> "closed".equals(i.getStatus())).count();
        
        stats.put("open", openCount);
        stats.put("assigned", assignedCount);
        stats.put("inProgress", inProgressCount);
        stats.put("resolved", resolvedCount);
        stats.put("closed", closedCount);

        Map<String, Long> byType = new HashMap<>();
        for (Issue issue : allIssues) {
            byType.merge(issue.getType(), 1L, Long::sum);
        }
        stats.put("byType", byType);

        Map<String, Long> byPriority = new HashMap<>();
        for (Issue issue : allIssues) {
            byPriority.merge(issue.getPriority(), 1L, Long::sum);
        }
        stats.put("byPriority", byPriority);

        return stats;
    }

    private String generateCode() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "ISS-" + date + "-" + String.format("%05d", codeGenerator.incrementAndGet() % 100000);
    }

    private void loadIssueRelations(Issue issue) {
    }

    private void addStatusHistory(Long issueId, String fromStatus, String toStatus, Long operatorId, String remark) {
        IssueStatusHistory history = new IssueStatusHistory();
        history.setIssueId(issueId);
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setOperatorId(operatorId);
        history.setRemark(remark);
        history.setCreatedBy(operatorId);
        history.setUpdatedBy(operatorId);
        statusHistoryMapper.insert(history);
    }
}
