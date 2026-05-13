package com.autonoma.erp.service;

import com.autonoma.erp.model.SmPriceMaster;
import com.autonoma.erp.repository.SmPriceMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SmPriceMasterService {

    @Autowired
    private SmPriceMasterRepository priceMasterRepository;

    public List<SmPriceMaster> getAllMasters() {
        return priceMasterRepository.findAll();
    }

    public Optional<SmPriceMaster> getMasterById(Long id) {
        return priceMasterRepository.findById(id);
    }

    public SmPriceMaster saveMaster(SmPriceMaster master) {
        if (master.getCreatedBy() == null) {
            master.setCreatedBy("admin");
        }
        if (master.getMasterNo() == null || master.getMasterNo().isEmpty()) {
            Long maxId = priceMasterRepository.findMaxId().orElse(0L);
            master.setMasterNo("PM-" + String.format("%05d", maxId + 1));
        }
        return priceMasterRepository.save(master);
    }

    public void deleteMaster(Long id) {
        priceMasterRepository.deleteById(id);
    }

    public long countAll() {
        return priceMasterRepository.count();
    }
}
