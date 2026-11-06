package com.qveto.milesora.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Task;
import com.qveto.milesora.entity.TaskComment;
import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.repository.ProjectMemberRepository;
import com.qveto.milesora.repository.TaskCommentRepository;
import com.qveto.milesora.repository.TaskRepository;

@Service
@Transactional
public class TaskCommentService {

    private final TaskCommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final AppUserRepository userRepository;
    private final ProjectMemberRepository memberRepository;

    public TaskCommentService(
            TaskCommentRepository commentRepository,
            TaskRepository taskRepository,
            AppUserRepository userRepository,
            ProjectMemberRepository memberRepository) {

        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
    }

    // Add comment
    public TaskComment addComment(
            Long taskId, String content, Long requesterId) {

        Task task = getTask(taskId);
        AppUser author = getUser(requesterId);

        validateContent(content);
        validateProjectAccess(task, requesterId);

        TaskComment comment = new TaskComment();
        comment.setTask(task);
        comment.setAuthor(author);
        comment.setContent(content.trim());

        return commentRepository.save(comment);
    }

    // Get all comments
    @Transactional(readOnly = true)
    public List<TaskComment> getComments(
            Long taskId, Long requesterId) {

        Task task = getTask(taskId);
        validateProjectAccess(task, requesterId);

        return commentRepository
                .findAllByTask_IdOrderByCreatedAtAsc(taskId);
    }

    // Update own comment
    public TaskComment updateComment(
            Long taskId, Long commentId,
            String content, Long requesterId) {

        validateContent(content);

        TaskComment comment = getComment(taskId, commentId);

        validateProjectAccess(comment.getTask(), requesterId);

        if (!comment.getAuthor().getId().equals(requesterId)) {
            throw new SecurityException(
                    "You can only edit your own comments");
        }

        comment.setContent(content.trim());

        return commentRepository.save(comment);
    }

    // Delete own comment
    public void deleteComment(
            Long taskId, Long commentId, Long requesterId) {

        TaskComment comment = getComment(taskId, commentId);

        validateProjectAccess(comment.getTask(), requesterId);

        if (!comment.getAuthor().getId().equals(requesterId)) {
            throw new SecurityException(
                    "You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    // Validate project access
    private void validateProjectAccess(
            Task task, Long requesterId) {

        boolean isOwner =
                task.getProject().getCreatedBy()
                        .getId().equals(requesterId);

        boolean isMember =
                memberRepository.existsByProject_IdAndUser_Id(
                        task.getProject().getId(), requesterId);

        if (!isOwner && !isMember) {
            throw new SecurityException(
                    "You do not have access to this project");
        }
    }

    private void validateContent(String content) {

        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException(
                    "Comment content is required");
        }

        if (content.trim().length() > 5000) {
            throw new IllegalArgumentException(
                    "Comment cannot exceed 5000 characters");
        }
    }

    private Task getTask(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Task not found"));
    }

    private TaskComment getComment(
            Long taskId, Long commentId) {

        return commentRepository
                .findByIdAndTask_Id(commentId, taskId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Comment not found"));
    }

    private AppUser getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }
}