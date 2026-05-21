package com.autonoma.erp.service;

import com.autonoma.erp.model.ModeOfDespatch;
import com.autonoma.erp.repository.ModeOfDespatchRepository;
import com.autonoma.erp.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ModeOfDespatchService {

    @Autowired
    private ModeOfDespatchRepository repository;

    public List<ModeOfDespatch> getAll() {
        return repository.findAll();
    }

    public List<ModeOfDespatch> getActive() {
        return repository.findByStatus("Active");
    }

    public Optional<ModeOfDespatch> getById(Long id) {
        return repository.findById(id);
    }

    public ModeOfDespatch save(ModeOfDespatch item) {
        String currentUser = SecurityUtils.getCurrentUserId();
        if (currentUser == null) {
            currentUser = "SYSTEM";
        }
        if (item.getId() == null) {
            item.setCreatedBy(currentUser);
            item.setCreatedDate(LocalDateTime.now());
        } else {
            // Keep original audit fields from db if they exist
            Optional<ModeOfDespatch> existing = repository.findById(item.getId());
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
