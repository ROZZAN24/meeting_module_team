package com.autonoma.erp.repository;

import com.autonoma.erp.model.EmailContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmailContentRepository extends JpaRepository<EmailContent, Long> {
    List<EmailContent> findByTypeAndStatus(String type, String status);

    @Query("SELECT MAX(e.id) FROM EmailContent e")
    Long findMaxId();
}
