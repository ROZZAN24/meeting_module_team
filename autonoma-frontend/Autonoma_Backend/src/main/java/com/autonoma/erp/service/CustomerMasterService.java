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
        if (customer.getCustomerCode() == null || customer.getCustomerCode().isEmpty()) {
            customer.setCustomerCode(generateNextCode());
        }
        return repository.save(customer);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        repository.deleteById(id);
    }

    public String getNextCode() {
        return generateNextCode();
    }

    private String generateNextCode() {
        String maxCode = repository.findMaxCustomerCode();
        String year = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yy"));
        String prefix = "C-" + year + "-";
        
        if (maxCode == null || !maxCode.startsWith(prefix)) {
            return prefix + "00001";
        }
        
        try {
            // Assumes format C-26-00001
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
