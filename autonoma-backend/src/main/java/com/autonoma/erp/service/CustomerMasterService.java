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
        }
    }
}
