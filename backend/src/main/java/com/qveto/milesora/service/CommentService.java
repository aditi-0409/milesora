package com.qveto.milesora.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.qveto.milesora.dto.CommentResponse;
import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.entity.Comment;
import com.qveto.milesora.entity.Project;
import com.qveto.milesora.entity.ProjectMember;
import com.qveto.milesora.entity.ProjectMemberRole;
import com.qveto.milesora.entity.Role;
import com.qveto.milesora.repository.AppUserRepository;
import com.qveto.milesora.repository.CommentRepository;
import com.qveto.milesora.repository.ProjectMemberRepository;
import com.qveto.milesora.repository.ProjectRepository;

@Service
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final AppUserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public CommentService(
            CommentRepository commentRepository,
            AppUserRepository userRepository,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository) {

        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
    }

    // Add a comment to a project.
    public CommentResponse addComment(
            Long projectId, String content, String username) {

        AppUser user = getUser(username);
        Project project = getProject(projectId);

        requireProjectAccess(project, user);
        requireCanComment(project, user);

        validateContent(content);

        Comment comment = new Comment();
        comment.setContent(content.trim());
        comment.setProject(project);
        comment.setUser(user);

        Comment savedComment = commentRepository.save(comment);
        return new CommentResponse(savedComment);
    }

    // Get all comments belonging to a project.
    @Transactional(readOnly = true)
    public List<CommentResponse> getProjectComments(
            Long projectId, String username) {

        AppUser user = getUser(username);
        Project project = getProject(projectId);

        requireProjectAccess(project, user);

        return commentRepository
                .findAllByProject_IdOrderByCreatedAtAsc(projectId)
                .stream()
                .map(CommentResponse::new)
                .toList();
    }

    // Edit only the comment author's comment.
    public CommentResponse updateComment(
            Long commentId, String content, String username) {

        AppUser user = getUser(username);

        Comment comment = getComment(commentId);

        requireProjectAccess(comment.getProject(), user);

        if (!comment.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can edit only your own comments.");
        }

        requireCanComment(comment.getProject(), user);
        validateContent(content);

        comment.setContent(content.trim());

        Comment updatedComment = commentRepository.save(comment);
        return new CommentResponse(updatedComment);
    }

    // Delete own comment or moderate according to role.
    public void deleteComment(Long commentId, String username) {

        AppUser user = getUser(username);
        Comment comment = getComment(commentId);

        Project project = comment.getProject();

        boolean isAuthor =
                comment.getUser().getId().equals(user.getId());

        if (isAuthor) {
            requireProjectAccess(project, user);
            requireCanComment(project, user);
        } else {

            boolean isAdmin = user.getRole() == Role.ADMIN;

            boolean isCreator = isProjectCreator(project, user);

            ProjectMember membership =
                    projectMemberRepository
                            .findByProject_IdAndUser_Id(
                                    project.getId(), user.getId())
                            .orElse(null);

            boolean isManager =
                    membership != null
                    && (membership.getRole() == ProjectMemberRole.OWNER
                    || membership.getRole() == ProjectMemberRole.MANAGER);

            if (!isAdmin && !isCreator && !isManager) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to delete this comment.");
            }
        }

        commentRepository.delete(comment);
    }

    private AppUser getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found."));
    }

    private Project getProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Project not found."));
    }

    private Comment getComment(Long commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Comment not found."));
    }

    private boolean isProjectCreator(
            Project project, AppUser user) {

        return project.getCreatedBy().getId().equals(user.getId());
    }

    // Verify that the user can access this project's comments.
    private void requireProjectAccess(
            Project project, AppUser user) {

        boolean isAdmin = user.getRole() == Role.ADMIN;

        boolean isCreator =
                project.getCreatedBy().getId().equals(user.getId());

        boolean isMember =
                projectMemberRepository
                        .existsByProject_IdAndUser_Id(
                                project.getId(), user.getId());

        if (!isAdmin && !isCreator && !isMember) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have access to this project.");
        }
    }

    // Verify that the user can add or edit comments.
    private void requireCanComment(
            Project project, AppUser user) {

        // Admin and project creator have access.
        if (user.getRole() == Role.ADMIN ||
                isProjectCreator(project, user)) {
            return;
        }

        ProjectMember membership =
                projectMemberRepository
                        .findByProject_IdAndUser_Id(
                                project.getId(), user.getId())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.FORBIDDEN,
                                "Project membership is required."));

        if (membership.getRole() == ProjectMemberRole.VIEWER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Viewers cannot add or edit comments.");
        }
    }

    private void validateContent(String content) {

        if (content == null || content.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Comment content cannot be empty.");
        }

        if (content.trim().length() > 2000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Comment cannot exceed 2000 characters.");
        }
    }
}