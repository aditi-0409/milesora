package com.qveto.milesora.report;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.qveto.milesora.entity.TimeEntry;

public interface ReportRepository
        extends JpaRepository<TimeEntry, Long> {

    // Retrieve all time entries belonging to a project
    @Query("""
            SELECT te
            FROM TimeEntry te
            WHERE te.task.project.id = :projectId
            ORDER BY te.entryDate DESC
            """)
    List<TimeEntry> findAllTimeEntriesByProjectId(
            @Param("projectId") Long projectId);
}