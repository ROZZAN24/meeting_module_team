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
        if (supplier.getSupplierCode() == null || supplier.getSupplierCode().isEmpty()) {
            supplier.setSupplierCode(generateSupplierCode());
        }
        return repository.save(supplier);
    }

    public void deleteSupplier(Long id) {
        repository.deleteById(id);
    }

    private String generateSupplierCode() {
        String lastCode = repository.findMaxSupplierCode();
        if (lastCode == null || lastCode.isEmpty()) {
            return "SUP-00001";
        }
        try {
            int lastNum = Integer.parseInt(lastCode.substring(4));
            return String.format("SUP-%05d", lastNum + 1);
        } catch (Exception e) {
            return "SUP-" + System.currentTimeMillis();
        }
    }
}
