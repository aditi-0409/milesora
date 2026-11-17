package com.qveto.milesora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.qveto.milesora.entity.Discussion;

@Repository
public interface DiscussionRepository
        extends JpaRepository<Discussion, Long> {

    List<Discussion> findAllByOrderByPinnedDescCreatedAtDesc();
}