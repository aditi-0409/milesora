package com.qveto.milesora.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.ProjectMember;
import com.qveto.milesora.entity.ProjectMemberRole;
import com.qveto.milesora.entity.Role;
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

        validateContent(content);

        Task task = getTask(taskId);
        AppUser requester = getUser(requesterId);

        validateCommentWriteAccess(task, requester);

        TaskComment comment = new TaskComment();
        comment.setTask(task);
        comment.setAuthor(requester);
        comment.setContent(content.trim());

        return commentRepository.save(comment);
    }

    // Get all comments
    @Transactional(readOnly = true)
    public List<TaskComment> getComments(
            Long taskId, Long requesterId) {

        Task task = getTask(taskId);
        AppUser requester = getUser(requesterId);

        validateProjectViewAccess(task, requester);

        return commentRepository
                .findAllByTask_IdOrderByCreatedAtAsc(taskId);
    }

    // Update own comment or moderate another user's comment
    public TaskComment updateComment(
            Long taskId, Long commentId,
            String content, Long requesterId) {

        validateContent(content);

        TaskComment comment = getComment(taskId, commentId);
        AppUser requester = getUser(requesterId);

        validateCommentWriteAccess(comment.getTask(), requester);

        boolean isAuthor =
                comment.getAuthor().getId().equals(requesterId);

        if (!isAuthor && !canModerate(comment.getTask(), requester)) {
            throw new SecurityException(
                    "You are not authorized to edit this comment");
        }

        comment.setContent(content.trim());

        return commentRepository.save(comment);
    }

    // Delete own comment or moderate another user's comment
    public void deleteComment(
            Long taskId, Long commentId, Long requesterId) {

        TaskComment comment = getComment(taskId, commentId);
        AppUser requester = getUser(requesterId);

        validateCommentWriteAccess(comment.getTask(), requester);

        boolean isAuthor =
                comment.getAuthor().getId().equals(requesterId);

        if (!isAuthor && !canModerate(comment.getTask(), requester)) {
            throw new SecurityException(
                    "You are not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }

    // Check whether user can view project comments
    private void validateProjectViewAccess(
            Task task, AppUser requester) {

        if (isAdmin(requester) || isProjectOwner(task, requester)) {
            return;
        }

        ProjectMember membership = getMembership(task, requester);

        if (membership == null) {
            throw new SecurityException(
                    "You do not have access to this project");
        }
    }

    // Check whether user can add or modify comments
    private void validateCommentWriteAccess(
            Task task, AppUser requester) {

        if (isAdmin(requester) || isProjectOwner(task, requester)) {
            return;
        }

        ProjectMember membership = getMembership(task, requester);

        if (membership == null) {
            throw new SecurityException(
                    "You do not have access to this project");
        }

        if (membership.getRole() == ProjectMemberRole.VIEWER) {
            throw new SecurityException(
                    "Viewers cannot add, edit or delete comments");
        }
    }

    // Check whether user can moderate other users' comments
    private boolean canModerate(
            Task task, AppUser requester) {

        if (isAdmin(requester) || isProjectOwner(task, requester)) {
            return true;
        }

        ProjectMember membership = getMembership(task, requester);

        return membership != null
                && (membership.getRole() == ProjectMemberRole.OWNER
                || membership.getRole() == ProjectMemberRole.MANAGER);
    }

    // Check global Admin role
    private boolean isAdmin(AppUser requester) {
        return requester.getRole() == Role.ADMIN;
    }

    // Check project creator
    private boolean isProjectOwner(
            Task task, AppUser requester) {

        return task.getProject().getCreatedBy()
                .getId().equals(requester.getId());
    }

    // Retrieve project membership
    private ProjectMember getMembership(
            Task task, AppUser requester) {

        return memberRepository
                .findByProject_IdAndUser_Id(
                        task.getProject().getId(),
                        requester.getId())
                .orElse(null);
    }

    // Validate comment content
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

    // Find task
    private Task getTask(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Task not found"));
    }

    // Find comment belonging to the specified task
    private TaskComment getComment(
            Long taskId, Long commentId) {

        return commentRepository
                .findByIdAndTask_Id(commentId, taskId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Comment not found"));
    }

    // Find user
    private AppUser getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }
}