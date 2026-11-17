package com.qveto.milesora.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qveto.milesora.entity.TaskDependency;

public interface TaskDependencyRepository
        extends JpaRepository<TaskDependency, Long> {

    List<TaskDependency> findAllByTask_Id(Long taskId);

    List<TaskDependency> findAllByDependsOnTask_Id(Long taskId);

    Optional<TaskDependency> findByTask_IdAndDependsOnTask_Id(
            Long taskId, Long dependsOnTaskId);

    boolean existsByTask_IdAndDependsOnTask_Id(
            Long taskId, Long dependsOnTaskId);

    void deleteByTask_IdAndDependsOnTask_Id(
            Long taskId, Long dependsOnTaskId);
    
    void deleteAllByTask_Id(Long taskId);

    void deleteAllByDependsOnTask_Id(Long taskId);
}