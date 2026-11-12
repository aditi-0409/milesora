package com.qveto.milesora.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qveto.milesora.entity.TimeEntry;

public interface TimeEntryRepository
        extends JpaRepository<TimeEntry, Long> {

    // Find all time entries for a particular task
    List<TimeEntry> findAllByTask_IdOrderByEntryDateDesc(Long taskId);

    // Find all time entries recorded by a particular user
    List<TimeEntry> findAllByUser_IdOrderByEntryDateDesc(Long userId);

    // Find a specific time entry belonging to a user
    Optional<TimeEntry> findByIdAndUser_Id(Long id, Long userId);
    Optional<TimeEntry> findByIdAndTask_Id(Long id, Long taskId);

    // Find all time entries for a task and user
    List<TimeEntry> findAllByTask_IdAndUser_IdOrderByEntryDateDesc(
            Long taskId, Long userId);

}