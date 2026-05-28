package com.autonoma.erp.service;

import com.autonoma.erp.model.SmQuotation;
import com.autonoma.erp.repository.SmQuotationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SmQuotationService {

    @Autowired
    private SmQuotationRepository quotationRepository;

    public List<SmQuotation> getAllQuotations() {
        return quotationRepository.findAll();
    }

    public Optional<SmQuotation> getQuotationById(Long id) {
        return quotationRepository.findById(id);
    }

    public SmQuotation saveQuotation(SmQuotation quotation) {
        if (quotation.getCreatedBy() == null) {
            quotation.setCreatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
        }
        if (quotation.getQuotationNo() == null || quotation.getQuotationNo().isEmpty()) {
            Long maxId = quotationRepository.findMaxId().orElse(0L);
            quotation.setQuotationNo("QTN-" + String.format("%05d", maxId + 1));
        }
        return quotationRepository.save(quotation);
    }

    public void deleteQuotation(Long id) {
        quotationRepository.deleteById(id);
    }

    public long countAll() {
        return quotationRepository.count();
    }

    public long countByStatus(String status) {
        return quotationRepository.findByStatus(status).size();
    }
}

