package com.qveto.milesora.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qveto.milesora.entity.TaskComment;

public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {

    List<TaskComment> findAllByTask_IdOrderByCreatedAtAsc(Long taskId);

    Optional<TaskComment> findByIdAndTask_Id(Long id, Long taskId);

    boolean existsByIdAndAuthor_Id(Long id, Long authorId);
    
    void deleteAllByTask_Id(Long taskId);
}