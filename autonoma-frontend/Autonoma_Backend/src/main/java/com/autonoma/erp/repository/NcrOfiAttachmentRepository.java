package com.autonoma.erp.repository;

import com.autonoma.erp.model.NcrOfiAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NcrOfiAttachmentRepository extends JpaRepository<NcrOfiAttachment, Integer> {
    List<NcrOfiAttachment> findByNcrOfiId(Integer ncrOfiId);
}
