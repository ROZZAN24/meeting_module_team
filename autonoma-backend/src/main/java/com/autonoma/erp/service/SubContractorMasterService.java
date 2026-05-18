package com.autonoma.erp.service;

import com.autonoma.erp.model.SubContractorMaster;
import com.autonoma.erp.repository.SubContractorMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class SubContractorMasterService {

    @Autowired
    private SubContractorMasterRepository repository;

    public List<SubContractorMaster> getAllSubContractors() {
        return repository.findAll();
    }

    public Optional<SubContractorMaster> getSubContractorById(Long id) {
        return repository.findById(id);
    }

    public SubContractorMaster saveSubContractor(SubContractorMaster subcontractor) {
<<<<<<< HEAD
        if (subcontractor.getId() == null) {
            if (repository.existsBySubcontractorNameIgnoreCase(subcontractor.getSubcontractorName())) {
                throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Duplicate value! Please check.");
            }
        } else {
            if (repository.existsBySubcontractorNameIgnoreCaseAndIdNot(subcontractor.getSubcontractorName(), subcontractor.getId())) {
                throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Duplicate value! Please check.");
            }
        }

=======
>>>>>>> origin/chore/repo-cleanup
        if (subcontractor.getSubcontractorCode() == null || subcontractor.getSubcontractorCode().isEmpty()) {
            subcontractor.setSubcontractorCode(generateSubContractorCode());
        }
        return repository.save(subcontractor);
    }

    public void deleteSubContractor(Long id) {
        repository.deleteById(id);
    }

    private String generateSubContractorCode() {
        String lastCode = repository.findMaxSubcontractorCode();
        if (lastCode == null || lastCode.isEmpty()) {
            return "SUB-00001";
        }
        try {
            int lastNum = Integer.parseInt(lastCode.substring(4));
            return String.format("SUB-%05d", lastNum + 1);
        } catch (Exception e) {
            return "SUB-" + System.currentTimeMillis();
        }
    }
}
