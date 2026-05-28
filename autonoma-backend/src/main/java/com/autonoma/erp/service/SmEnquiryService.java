package com.autonoma.erp.service;

import com.autonoma.erp.model.SmEnquiry;
import com.autonoma.erp.repository.SmEnquiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SmEnquiryService {

    @Autowired
    private SmEnquiryRepository enquiryRepository;

    public List<SmEnquiry> getAllEnquiries() {
        return enquiryRepository.findAll();
    }

    public Optional<SmEnquiry> getEnquiryById(Long id) {
        return enquiryRepository.findById(id);
    }

    public SmEnquiry saveEnquiry(SmEnquiry enquiry) {
        if (enquiry.getCreatedBy() == null) {
            enquiry.setCreatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
        }
        if (enquiry.getEnquiryNo() == null || enquiry.getEnquiryNo().isEmpty()) {
            Long maxId = enquiryRepository.findMaxId().orElse(0L);
            enquiry.setEnquiryNo("ENQ-" + String.format("%05d", maxId + 1));
        }
        return enquiryRepository.save(enquiry);
    }

    public void deleteEnquiry(Long id) {
        enquiryRepository.deleteById(id);
    }

    public List<SmEnquiry> getEnquiriesByStatus(String status) {
        return enquiryRepository.findByStatus(status);
    }

    public long countAll() {
        return enquiryRepository.count();
    }

    public long countByStatus(String status) {
        return enquiryRepository.findByStatus(status).size();
    }
}

