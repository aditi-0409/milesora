package com.qveto.milesora.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qveto.milesora.entity.Comment;

public interface CommentRepository
        extends JpaRepository<Comment, Long> {

    // Find all comments belonging to a project.
    List<Comment> findAllByProject_IdOrderByCreatedAtAsc(
            Long projectId);

    // Find a comment belonging to a particular user.
    Optional<Comment> findByIdAndUser_Id(
            Long commentId, Long userId);

    // Find a comment belonging to a particular project.
    Optional<Comment> findByIdAndProject_Id(
            Long commentId, Long projectId);

    // Check whether a user owns a particular comment.
    boolean existsByIdAndUser_Id(
            Long commentId, Long userId);
}