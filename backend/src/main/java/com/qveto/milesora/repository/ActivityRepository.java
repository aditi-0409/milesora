package com.qveto.milesora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qveto.milesora.entity.Activity;

public interface ActivityRepository
        extends JpaRepository<Activity, Long> {

    List<Activity> findTop50ByOrderByTimestampDesc();
}