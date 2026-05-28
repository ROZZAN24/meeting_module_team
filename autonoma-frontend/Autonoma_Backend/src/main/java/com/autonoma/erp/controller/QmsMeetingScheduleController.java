package com.autonoma.erp.controller;

import com.autonoma.erp.model.QmsMeetingSchedule;
import com.autonoma.erp.service.QmsMeetingScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.autonoma.erp.security.RequirePagePermission;

@RestController
@RequestMapping("/api/qms/meeting-schedules")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QmsMeetingScheduleController {
    private final QmsMeetingScheduleService service;

    @GetMapping
    public List<QmsMeetingSchedule> getAll() {
        return service.getAllSchedules();
    }

    @GetMapping("/{id}")
    public ResponseEntity<QmsMeetingSchedule> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getScheduleById(id));
    }

    @PostMapping
    @RequirePagePermission(pageCode = "QM1310", action = "write")
    public ResponseEntity<QmsMeetingSchedule> create(@RequestBody QmsMeetingSchedule schedule) {
        return ResponseEntity.ok(service.saveSchedule(schedule));
    }

    @PutMapping("/{id}")
    @RequirePagePermission(pageCode = "QM1310", action = "write")
    public ResponseEntity<QmsMeetingSchedule> update(@PathVariable Long id, @RequestBody QmsMeetingSchedule schedule) {
        schedule.setId(id);
        return ResponseEntity.ok(service.saveSchedule(schedule));
    }

    @DeleteMapping("/{id}")
    @RequirePagePermission(pageCode = "QM1310", action = "delete")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.deleteSchedule(id);
            return ResponseEntity.noContent().build();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Cannot delete this schedule because it is actively linked to existing Meeting Minutes (MOM) records. Please delete the associated MOMs first."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Failed to delete schedule: " + e.getMessage()));
        }
    }
}
