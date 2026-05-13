package com.autonoma.erp.controller;

import com.autonoma.erp.model.*;
import com.autonoma.erp.service.EmployeeMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/master/employee")
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "HRM - Employee Master", description = "Full Employee Master CRUD with sub-resources")
public class EmployeeMasterController {

    @Autowired
    private EmployeeMasterService service;

    // ======================== EMPLOYEE MASTER ========================

    @GetMapping
    @Operation(summary = "List all employees")
    public List<EmployeeMaster> getAllEmployees() {
        return service.getAllEmployees();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee by ID")
    public ResponseEntity<EmployeeMaster> getEmployeeById(@PathVariable Long id) {
        EmployeeMaster emp = service.getEmployeeById(id);
        return emp != null ? ResponseEntity.ok(emp) : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/full")
    @Operation(summary = "Get employee with ALL sub-resources (full form load)")
    public ResponseEntity<Map<String, Object>> getEmployeeFull(@PathVariable Long id) {
        Map<String, Object> data = service.getEmployeeFull(id);
        return data != null ? ResponseEntity.ok(data) : ResponseEntity.notFound().build();
    }

    @PostMapping
    @Operation(summary = "Create new employee")
    public EmployeeMaster createEmployee(@RequestBody EmployeeMaster employee) {
        return service.createEmployee(employee);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update employee")
    public ResponseEntity<EmployeeMaster> updateEmployee(@PathVariable Long id, @RequestBody EmployeeMaster details) {
        EmployeeMaster updated = service.updateEmployee(id, details);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete employee and all sub-resources")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        service.deleteEmployee(id);
        return ResponseEntity.ok().build();
    }

    // ======================== PERSONAL DETAIL ========================

    @GetMapping("/{id}/personal")
    @Operation(summary = "Get personal details")
    public ResponseEntity<?> getPersonalDetail(@PathVariable Long id) {
        EmployeePersonalDetail detail = service.getPersonalDetail(id);
        return detail != null ? ResponseEntity.ok(detail) : ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/personal")
    @Operation(summary = "Save/update personal details")
    public EmployeePersonalDetail savePersonalDetail(@PathVariable Long id, @RequestBody EmployeePersonalDetail detail) {
        return service.savePersonalDetail(id, detail);
    }

    // ======================== CONTACT ========================

    @GetMapping("/{id}/contact")
    @Operation(summary = "Get contact details")
    public ResponseEntity<?> getContact(@PathVariable Long id) {
        EmployeeContact contact = service.getContact(id);
        return contact != null ? ResponseEntity.ok(contact) : ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/contact")
    @Operation(summary = "Save/update contact details")
    public EmployeeContact saveContact(@PathVariable Long id, @RequestBody EmployeeContact contact) {
        return service.saveContact(id, contact);
    }

    // ======================== JOB PROFILE ========================

    @GetMapping("/{id}/job-profile")
    @Operation(summary = "Get job profile")
    public ResponseEntity<?> getJobProfile(@PathVariable Long id) {
        EmployeeJobProfile profile = service.getJobProfile(id);
        return profile != null ? ResponseEntity.ok(profile) : ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/job-profile")
    @Operation(summary = "Save/update job profile")
    public EmployeeJobProfile saveJobProfile(@PathVariable Long id, @RequestBody EmployeeJobProfile profile) {
        return service.saveJobProfile(id, profile);
    }

    // ======================== EDUCATION (1:N) ========================

    @GetMapping("/{id}/education")
    @Operation(summary = "Get all education records")
    public List<EmployeeEducation> getEducation(@PathVariable Long id) {
        return service.getEducation(id);
    }

    @PostMapping("/{id}/education")
    @Operation(summary = "Add/update education record")
    public EmployeeEducation saveEducation(@PathVariable Long id, @RequestBody EmployeeEducation edu) {
        return service.saveEducation(id, edu);
    }

    @DeleteMapping("/education/{eduId}")
    @Operation(summary = "Delete education record")
    public ResponseEntity<Void> deleteEducation(@PathVariable Long eduId) {
        service.deleteEducation(eduId);
        return ResponseEntity.ok().build();
    }

    // ======================== EXPERIENCE (1:N) ========================

    @GetMapping("/{id}/experience")
    @Operation(summary = "Get all experience records")
    public List<EmployeeExperience> getExperience(@PathVariable Long id) {
        return service.getExperience(id);
    }

    @PostMapping("/{id}/experience")
    @Operation(summary = "Add/update experience record")
    public EmployeeExperience saveExperience(@PathVariable Long id, @RequestBody EmployeeExperience exp) {
        return service.saveExperience(id, exp);
    }

    @DeleteMapping("/experience/{expId}")
    @Operation(summary = "Delete experience record")
    public ResponseEntity<Void> deleteExperience(@PathVariable Long expId) {
        service.deleteExperience(expId);
        return ResponseEntity.ok().build();
    }

    // ======================== EMERGENCY CONTACT (1:N) ========================

    @GetMapping("/{id}/emergency-contact")
    @Operation(summary = "Get all emergency contacts")
    public List<EmployeeEmergencyContact> getEmergencyContacts(@PathVariable Long id) {
        return service.getEmergencyContacts(id);
    }

    @PostMapping("/{id}/emergency-contact")
    @Operation(summary = "Add/update emergency contact")
    public EmployeeEmergencyContact saveEmergencyContact(@PathVariable Long id, @RequestBody EmployeeEmergencyContact ec) {
        return service.saveEmergencyContact(id, ec);
    }

    @DeleteMapping("/emergency-contact/{ecId}")
    @Operation(summary = "Delete emergency contact")
    public ResponseEntity<Void> deleteEmergencyContact(@PathVariable Long ecId) {
        service.deleteEmergencyContact(ecId);
        return ResponseEntity.ok().build();
    }

    // ======================== PASSPORT ========================

    @GetMapping("/{id}/passport")
    @Operation(summary = "Get passport details")
    public ResponseEntity<?> getPassport(@PathVariable Long id) {
        EmployeePassport passport = service.getPassport(id);
        return passport != null ? ResponseEntity.ok(passport) : ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/passport")
    @Operation(summary = "Save/update passport details")
    public EmployeePassport savePassport(@PathVariable Long id, @RequestBody EmployeePassport passport) {
        return service.savePassport(id, passport);
    }

    // ======================== DEPENDENT (1:N) ========================

    @GetMapping("/{id}/dependent")
    @Operation(summary = "Get all dependents")
    public List<EmployeeDependent> getDependents(@PathVariable Long id) {
        return service.getDependents(id);
    }

    @PostMapping("/{id}/dependent")
    @Operation(summary = "Add/update dependent")
    public EmployeeDependent saveDependent(@PathVariable Long id, @RequestBody EmployeeDependent dep) {
        return service.saveDependent(id, dep);
    }

    @DeleteMapping("/dependent/{depId}")
    @Operation(summary = "Delete dependent")
    public ResponseEntity<Void> deleteDependent(@PathVariable Long depId) {
        service.deleteDependent(depId);
        return ResponseEntity.ok().build();
    }

    // ======================== ASSET (1:N) ========================

    @GetMapping("/{id}/asset")
    @Operation(summary = "Get all assets")
    public List<EmployeeAsset> getAssets(@PathVariable Long id) {
        return service.getAssets(id);
    }

    @PostMapping("/{id}/asset")
    @Operation(summary = "Add/update asset")
    public EmployeeAsset saveAsset(@PathVariable Long id, @RequestBody EmployeeAsset asset) {
        return service.saveAsset(id, asset);
    }

    @DeleteMapping("/asset/{assetId}")
    @Operation(summary = "Delete asset")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long assetId) {
        service.deleteAsset(assetId);
        return ResponseEntity.ok().build();
    }

    // ======================== KYC ========================

    @GetMapping("/{id}/kyc")
    @Operation(summary = "Get KYC details")
    public ResponseEntity<?> getKyc(@PathVariable Long id) {
        EmployeeKyc kyc = service.getKyc(id);
        return kyc != null ? ResponseEntity.ok(kyc) : ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/kyc")
    @Operation(summary = "Save/update KYC details")
    public EmployeeKyc saveKyc(@PathVariable Long id, @RequestBody EmployeeKyc kyc) {
        return service.saveKyc(id, kyc);
    }

    // ======================== KYC DOCUMENT (1:N) ========================

    @GetMapping("/{id}/kyc-document")
    @Operation(summary = "Get all KYC documents")
    public List<EmployeeKycDocument> getKycDocuments(@PathVariable Long id) {
        return service.getKycDocuments(id);
    }

    @PostMapping("/{id}/kyc-document")
    @Operation(summary = "Add/update KYC document")
    public EmployeeKycDocument saveKycDocument(@PathVariable Long id, @RequestBody EmployeeKycDocument doc) {
        return service.saveKycDocument(id, doc);
    }

    @DeleteMapping("/kyc-document/{docId}")
    @Operation(summary = "Delete KYC document")
    public ResponseEntity<Void> deleteKycDocument(@PathVariable Long docId) {
        service.deleteKycDocument(docId);
        return ResponseEntity.ok().build();
    }

    // ======================== ACTIVITY (1:N) ========================

    @GetMapping("/{id}/activity")
    @Operation(summary = "Get all activities")
    public List<EmployeeActivity> getActivities(@PathVariable Long id) {
        return service.getActivities(id);
    }

    @PostMapping("/{id}/activity")
    @Operation(summary = "Add/update activity")
    public EmployeeActivity saveActivity(@PathVariable Long id, @RequestBody EmployeeActivity activity) {
        return service.saveActivity(id, activity);
    }

    @DeleteMapping("/activity/{actId}")
    @Operation(summary = "Delete activity")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long actId) {
        service.deleteActivity(actId);
        return ResponseEntity.ok().build();
    }
}
