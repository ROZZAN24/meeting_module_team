package com.nutech.email.repository;

import com.nutech.email.model.ProcessingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProcessingRequestRepository extends JpaRepository<ProcessingRequest, Long> {
    Optional<ProcessingRequest> findByEmailMessageId(String emailMessageId);
    boolean existsByEmailMessageId(String emailMessageId);
    List<ProcessingRequest> findByStatusOrderByCreatedAtDesc(ProcessingRequest.ProcessingStatus status);
    List<ProcessingRequest> findTop50ByOrderByCreatedAtDesc();
}
