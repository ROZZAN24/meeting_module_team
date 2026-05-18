package com.autonoma.erp.service;

import com.autonoma.erp.model.SupplierMaster;
import com.autonoma.erp.repository.SupplierMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SupplierMasterService {

    private final SupplierMasterRepository repository;

    public List<SupplierMaster> getAllSuppliers() {
        return repository.findAll();
    }

    public Optional<SupplierMaster> getSupplierById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public SupplierMaster saveSupplier(SupplierMaster supplier) {
        if (supplier.getSupplierCode() == null || supplier.getSupplierCode().isEmpty()) {
            supplier.setSupplierCode(generateNextCode());
        }
        return repository.save(supplier);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        repository.deleteById(id);
    }

    public String getNextCode() {
        return generateNextCode();
    }

    private String generateNextCode() {
        String maxCode = repository.findMaxSupplierCode();
        String year = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yy"));
        String prefix = "S-" + year + "-";
        
        if (maxCode == null || !maxCode.startsWith(prefix)) {
            return prefix + "00001";
        }
        
        try {
            // Assumes format S-26-00001
            String[] parts = maxCode.split("-");
            if (parts.length == 3) {
                int lastNum = Integer.parseInt(parts[2]);
                return String.format(prefix + "%05d", lastNum + 1);
            }
            return prefix + "00001";
        } catch (Exception e) {
            return prefix + "00001";
        }
    }
}
