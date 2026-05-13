package com.autonoma.erp.controller;

import com.autonoma.erp.model.QmsMeetingMaster;
import com.autonoma.erp.service.QmsMeetingMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/qms/meetings")
@CrossOrigin(origins = "*")
public class QmsMeetingMasterController {

    @Autowired
    private QmsMeetingMasterService service;

    @GetMapping
    public List<QmsMeetingMaster> getAllMeetings() {
        return service.getAllMeetings();
    }

    @GetMapping("/{id}")
    public ResponseEntity<QmsMeetingMaster> getMeetingById(@PathVariable Integer id) {
        return service.getMeetingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public QmsMeetingMaster createMeeting(@RequestBody QmsMeetingMaster meeting) {
        return service.saveMeeting(meeting);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QmsMeetingMaster> updateMeeting(@PathVariable Integer id, @RequestBody QmsMeetingMaster meeting) {
        return service.getMeetingById(id)
                .map(existing -> {
                    meeting.setId(id);
                    return ResponseEntity.ok(service.saveMeeting(meeting));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable Integer id) {
        service.deleteMeeting(id);
        return ResponseEntity.ok().build();
    }
}
