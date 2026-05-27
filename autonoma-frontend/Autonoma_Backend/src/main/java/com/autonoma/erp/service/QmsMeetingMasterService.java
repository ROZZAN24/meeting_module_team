package com.autonoma.erp.service;

import com.autonoma.erp.model.QmsMeetingMaster;
import com.autonoma.erp.repository.QmsMeetingMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QmsMeetingMasterService {

    @Autowired
    private QmsMeetingMasterRepository repository;

    public List<QmsMeetingMaster> getAllMeetings() {
        return repository.findAll();
    }

    public Optional<QmsMeetingMaster> getMeetingById(Integer id) {
        return repository.findById(id);
    }

    public QmsMeetingMaster saveMeeting(QmsMeetingMaster meeting) {
        return repository.save(meeting);
    }

    public void deleteMeeting(Integer id) {
        repository.deleteById(id);
    }
}
