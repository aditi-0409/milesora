package com.qveto.milesora.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qveto.milesora.entity.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {

    // Find all tasks belonging to a project
    List<Task> findAllByProject_Id(Long projectId);

    // Find a specific task within a project
    Optional<Task> findByIdAndProject_Id(
            Long taskId, Long projectId);

    // Find tasks assigned to a particular user
    List<Task> findAllByAssignedTo_Id(Long userId);

    // Check whether a task belongs to a project
    boolean existsByIdAndProject_Id(
            Long taskId, Long projectId);
}