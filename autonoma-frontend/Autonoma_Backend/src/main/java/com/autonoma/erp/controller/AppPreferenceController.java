package com.autonoma.erp.controller;

import com.autonoma.erp.model.AppPreference;
import com.autonoma.erp.service.AppPreferenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/preferences")
@CrossOrigin(origins = "*")
public class AppPreferenceController {

    @Autowired
    private AppPreferenceService service;

    @GetMapping("/all")
    public List<AppPreference> getAllPreferences() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppPreference> getPreferenceById(@PathVariable Integer id) {
        Optional<AppPreference> preference = service.findById(id);
        return preference.map(ResponseEntity::ok)
                         .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public AppPreference createPreference(@RequestBody AppPreference preference) {
        preference.setCreatedDate(new Date());
        if (preference.getCreatedBy() == null || preference.getCreatedBy().isEmpty()) {
            preference.setCreatedBy("System");
        }
        return service.save(preference);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<AppPreference> updatePreference(@PathVariable Integer id, @RequestBody AppPreference preferenceDetails) {
        Optional<AppPreference> optionalPreference = service.findById(id);
        if (optionalPreference.isPresent()) {
            AppPreference preference = optionalPreference.get();
            preference.setPrefName(preferenceDetails.getPrefName());
            preference.setPrefValue(preferenceDetails.getPrefValue());
            preference.setComments(preferenceDetails.getComments());
            preference.setPrefType(preferenceDetails.getPrefType());
            preference.setUpdatedBy(preferenceDetails.getUpdatedBy() != null ? preferenceDetails.getUpdatedBy() : "System");
            preference.setUpdatedDate(new Date());
            return ResponseEntity.ok(service.save(preference));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePreference(@PathVariable Integer id) {
        Optional<AppPreference> preference = service.findById(id);
        if (preference.isPresent()) {
            service.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
