package com.qveto.milesora.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qveto.milesora.entity.ProjectMember;

public interface ProjectMemberRepository
        extends JpaRepository<ProjectMember, Long> {

    // Find all members of a project
    List<ProjectMember> findAllByProject_Id(Long projectId);

    // Check whether a user is already a member
    boolean existsByProject_IdAndUser_Id(
            Long projectId, Long userId);

    // Find a specific project membership
    Optional<ProjectMember> findByProject_IdAndUser_Id(
            Long projectId, Long userId);

    // Remove a specific membership
    void deleteByProject_IdAndUser_Id(
            Long projectId, Long userId);

    // Find all projects belonging to a user
    List<ProjectMember> findAllByUser_Id(Long userId);
}