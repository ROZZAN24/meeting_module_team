package com.autonoma.erp.service;

import com.autonoma.erp.model.CustomerMaster;
import com.autonoma.erp.repository.CustomerMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerMasterService {

    private final CustomerMasterRepository repository;

    public List<CustomerMaster> getAllCustomers() {
        return repository.findAll();
    }

    public Optional<CustomerMaster> getCustomerById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public CustomerMaster saveCustomer(CustomerMaster customer) {
<<<<<<< HEAD
        if (customer.getId() == null) {
            if (repository.existsByCustomerNameIgnoreCase(customer.getCustomerName())) {
                throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Duplicate value! Please check.");
            }
        } else {
            if (repository.existsByCustomerNameIgnoreCaseAndIdNot(customer.getCustomerName(), customer.getId())) {
                throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Duplicate value! Please check.");
            }
        }

=======
>>>>>>> origin/chore/repo-cleanup
        if (customer.getCustomerCode() == null || customer.getCustomerCode().isEmpty()) {
            customer.setCustomerCode(generateNextCode());
        }
        return repository.save(customer);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        repository.deleteById(id);
    }

<<<<<<< HEAD
    public String getNextCustomerCode() {
        return generateNextCode();
    }

    private String generateNextCode() {
        try {
            String year = String.valueOf(java.time.Year.now().getValue()).substring(2);
            String prefix = "C-" + year + "-";
            
            Optional<CustomerMaster> lastCustomer = repository.findTopByCustomerCodeStartingWithOrderByCustomerCodeDesc(prefix);
            
            if (lastCustomer.isEmpty()) {
                return prefix + "00001";
            }
            
            String lastCode = lastCustomer.get().getCustomerCode();
            String[] parts = lastCode.split("-");
            if (parts.length < 3) return prefix + "00001";
            
            int lastNum = Integer.parseInt(parts[2]);
            return String.format("%s%05d", prefix, lastNum + 1);
        } catch (Exception e) {
            e.printStackTrace();
            String year = String.valueOf(java.time.Year.now().getValue()).substring(2);
            return "C-" + year + "-00001";
=======
    private String generateNextCode() {
        String maxCode = repository.findMaxCustomerCode();
        if (maxCode == null || maxCode.isEmpty()) {
            return "CUST-00001";
        }
        try {
            int lastNum = Integer.parseInt(maxCode.split("-")[1]);
            return String.format("CUST-%05d", lastNum + 1);
        } catch (Exception e) {
            return "CUST-00001";
>>>>>>> origin/chore/repo-cleanup
        }
    }
}
