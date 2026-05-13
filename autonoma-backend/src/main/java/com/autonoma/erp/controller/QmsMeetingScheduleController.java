package com.autonoma.erp.controller;

import com.autonoma.erp.model.QmsMeetingSchedule;
import com.autonoma.erp.service.QmsMeetingScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
    public ResponseEntity<QmsMeetingSchedule> create(@RequestBody QmsMeetingSchedule schedule) {
        return ResponseEntity.ok(service.saveSchedule(schedule));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QmsMeetingSchedule> update(@PathVariable Long id, @RequestBody QmsMeetingSchedule schedule) {
        schedule.setId(id);
        return ResponseEntity.ok(service.saveSchedule(schedule));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
}
