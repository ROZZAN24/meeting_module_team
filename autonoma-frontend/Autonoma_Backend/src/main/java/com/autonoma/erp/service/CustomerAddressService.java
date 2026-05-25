package com.autonoma.erp.service;

import com.autonoma.erp.model.CustomerAddress;
import com.autonoma.erp.repository.CustomerAddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerAddressService {

    private final CustomerAddressRepository repository;

    public List<CustomerAddress> getAllAddresses() {
        return repository.findAll();
    }

    public List<CustomerAddress> getAddressesByCustomerId(Long customerId) {
        return repository.findByCustomerId(customerId);
    }

    public Optional<CustomerAddress> getAddressById(Long id) {
        return repository.findById(id);
    }

    public CustomerAddress saveAddress(CustomerAddress address) {
        return repository.save(address);
    }

    public void deleteAddress(Long id) {
        repository.deleteById(id);
    }
}
