package com.qveto.milesora.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.qveto.milesora.entity.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Find all projects created by a particular user
    List<Project> findAllByCreatedBy_Id(Long userId);

    // Find a project owned by a particular user
    Optional<Project> findByIdAndCreatedBy_Id(Long projectId, Long userId);
}