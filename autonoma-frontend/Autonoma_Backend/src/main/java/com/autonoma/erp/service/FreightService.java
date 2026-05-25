package com.autonoma.erp.service;

import com.autonoma.erp.model.Freight;
import com.autonoma.erp.repository.FreightRepository;
import com.autonoma.erp.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FreightService {

    @Autowired
    private FreightRepository repository;

    public List<Freight> getAll() {
        return repository.findAll();
    }

    public List<Freight> getActive() {
        return repository.findByStatus("Active");
    }

    public Optional<Freight> getById(Long id) {
        return repository.findById(id);
    }

    public Freight save(Freight item) {
        String currentUser = SecurityUtils.getCurrentUserId();
        if (currentUser == null) {
            currentUser = "SYSTEM";
        }
        if (item.getId() == null) {
            item.setCreatedBy(currentUser);
            item.setCreatedDate(LocalDateTime.now());
        } else {
            // Keep original audit fields from db if they exist
            Optional<Freight> existing = repository.findById(item.getId());
            if (existing.isPresent()) {
                item.setCreatedBy(existing.get().getCreatedBy());
                item.setCreatedDate(existing.get().getCreatedDate());
            }
            item.setUpdatedBy(currentUser);
            item.setUpdatedDate(LocalDateTime.now());
        }
        return repository.save(item);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
