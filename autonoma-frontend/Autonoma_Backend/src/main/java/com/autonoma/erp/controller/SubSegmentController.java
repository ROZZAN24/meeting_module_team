package com.autonoma.erp.controller;


import com.autonoma.erp.security.RequirePagePermission;
import com.autonoma.erp.model.SubSegment;
import com.autonoma.erp.repository.SubSegmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sm/sub-segments")
@CrossOrigin(origins = "*")
public class SubSegmentController {

    @Autowired
    private SubSegmentRepository repository;

    @GetMapping
    public List<SubSegment> getAll() {
        return repository.findAll();
    }

    @PostMapping


    @RequirePagePermission(pageCode = "M5280", action = "write")
    public SubSegment create(@RequestBody SubSegment item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")


    @RequirePagePermission(pageCode = "M5280", action = "write")
    public ResponseEntity<SubSegment> update(@PathVariable Long id, @RequestBody SubSegment item) {
        return repository.findById(id)
                .map(existing -> {
                    item.setId(id);
                    return ResponseEntity.ok(repository.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")


    @RequirePagePermission(pageCode = "M5280", action = "delete")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
