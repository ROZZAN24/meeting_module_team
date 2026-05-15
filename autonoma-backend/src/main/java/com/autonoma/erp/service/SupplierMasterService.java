package com.autonoma.erp.service;

import com.autonoma.erp.model.SupplierMaster;
import com.autonoma.erp.repository.SupplierMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class SupplierMasterService {

    @Autowired
    private SupplierMasterRepository repository;

    public List<SupplierMaster> getAllSuppliers() {
        return repository.findAll();
    }

    public Optional<SupplierMaster> getSupplierById(Long id) {
        return repository.findById(id);
    }

    public SupplierMaster saveSupplier(SupplierMaster supplier) {
        // Uniqueness checks
        if (supplier.getId() == null) {
            // New record
            if (repository.existsBySupplierName(supplier.getSupplierName())) {
                throw new RuntimeException("Supplier Name already exists!");
            }
            if (supplier.getSupplierCode() != null && !supplier.getSupplierCode().isEmpty()) {
                if (repository.existsBySupplierCode(supplier.getSupplierCode())) {
                    throw new RuntimeException("Supplier Code already exists!");
                }
            }
        } else {
            // Update
            if (repository.existsBySupplierNameAndIdNot(supplier.getSupplierName(), supplier.getId())) {
                throw new RuntimeException("Supplier Name already exists!");
            }
            if (supplier.getSupplierCode() != null && !supplier.getSupplierCode().isEmpty()) {
                if (repository.existsBySupplierCodeAndIdNot(supplier.getSupplierCode(), supplier.getId())) {
                    throw new RuntimeException("Supplier Code already exists!");
                }
            }
        }

        if (supplier.getSupplierCode() == null || supplier.getSupplierCode().isEmpty()) {
            supplier.setSupplierCode(generateSupplierCode());
        }
        return repository.save(supplier);
    }

    public void deleteSupplier(Long id) {
        repository.deleteById(id);
    }

    public String getNextSupplierCode() {
        return generateSupplierCode();
    }

    private String generateSupplierCode() {
        try {
            String year = String.valueOf(java.time.Year.now().getValue()).substring(2);
            String prefix = "S-" + year + "-";
            
            Optional<SupplierMaster> lastSupplier = repository.findTopBySupplierCodeStartingWithOrderBySupplierCodeDesc(prefix);
            
            if (lastSupplier.isEmpty()) {
                return prefix + "00001";
            }
            
            String lastCode = lastSupplier.get().getSupplierCode();
            String[] parts = lastCode.split("-");
            if (parts.length < 3) return prefix + "00001";
            
            int lastNum = Integer.parseInt(parts[2]);
            return String.format("%s%05d", prefix, lastNum + 1);
        } catch (Exception e) {
            e.printStackTrace(); // Minimal logging to stdout
            String year = String.valueOf(java.time.Year.now().getValue()).substring(2);
            return "S-" + year + "-00001";
        }
    }
}
