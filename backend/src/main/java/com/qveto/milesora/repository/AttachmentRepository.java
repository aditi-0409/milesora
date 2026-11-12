package com.qveto.milesora.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qveto.milesora.entity.Attachment;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    List<Attachment> findAllByTask_IdOrderByUploadedAtAsc(Long taskId);

    Optional<Attachment> findByIdAndTask_Id(Long id, Long taskId);

}