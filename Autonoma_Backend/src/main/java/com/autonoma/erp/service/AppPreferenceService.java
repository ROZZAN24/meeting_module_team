package com.autonoma.erp.service;

import com.autonoma.erp.model.AppPreference;
import com.autonoma.erp.repository.AppPreferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AppPreferenceService {

    @Autowired
    private AppPreferenceRepository repository;

    public List<AppPreference> findAll() {
        return repository.findAll();
    }

    public Optional<AppPreference> findById(Integer id) {
        return repository.findById(id);
    }

    public AppPreference save(AppPreference appPreference) {
        return repository.save(appPreference);
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}
