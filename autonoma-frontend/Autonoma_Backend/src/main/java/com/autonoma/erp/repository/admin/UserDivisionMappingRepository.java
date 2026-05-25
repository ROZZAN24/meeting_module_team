package com.autonoma.erp.repository.admin;

import com.autonoma.erp.model.admin.UserDivisionMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface UserDivisionMappingRepository extends JpaRepository<UserDivisionMapping, Long> {
    List<UserDivisionMapping> findByUserId(String userId);

    @Transactional
    void deleteByUserId(String userId);
}
