package com.autonoma.erp.repository.admin;

import com.autonoma.erp.model.admin.UserCompanyMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface UserCompanyMappingRepository extends JpaRepository<UserCompanyMapping, Long> {
    List<UserCompanyMapping> findByUserId(String userId);

    @Transactional
    void deleteByUserId(String userId);
}
