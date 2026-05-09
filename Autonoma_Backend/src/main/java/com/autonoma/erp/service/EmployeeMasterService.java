package com.autonoma.erp.service;

import com.autonoma.erp.model.*;
import com.autonoma.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class EmployeeMasterService {

    @Autowired private EmployeeMasterRepository employeeRepo;
    @Autowired private EmployeePersonalDetailRepository personalRepo;
    @Autowired private EmployeeContactRepository contactRepo;
    @Autowired private EmployeeJobProfileRepository jobProfileRepo;
    @Autowired private EmployeeEducationRepository educationRepo;
    @Autowired private EmployeeExperienceRepository experienceRepo;
    @Autowired private EmployeeEmergencyContactRepository emergencyContactRepo;
    @Autowired private EmployeePassportRepository passportRepo;
    @Autowired private EmployeeDependentRepository dependentRepo;
    @Autowired private EmployeeAssetRepository assetRepo;
    @Autowired private EmployeeKycRepository kycRepo;
    @Autowired private EmployeeKycDocumentRepository kycDocumentRepo;
    @Autowired private EmployeeActivityRepository activityRepo;

    // ======================== EMPLOYEE MASTER CRUD ========================

    public List<EmployeeMaster> getAllEmployees() {
        return employeeRepo.findAll();
    }

    public EmployeeMaster getEmployeeById(Long id) {
        return employeeRepo.findById(id).orElse(null);
    }

    /**
     * Returns the employee with ALL sub-resource data in a single Map.
     * This powers the full form load on the frontend.
     */
    public Map<String, Object> getEmployeeFull(Long id) {
        EmployeeMaster emp = employeeRepo.findById(id).orElse(null);
        if (emp == null) return null;

        Map<String, Object> result = new HashMap<>();
        result.put("employee", emp);
        result.put("personal", personalRepo.findByEmployeeId(id).orElse(null));
        result.put("contact", contactRepo.findByEmployeeId(id).orElse(null));
        result.put("jobProfile", jobProfileRepo.findByEmployeeId(id).orElse(null));
        result.put("education", educationRepo.findByEmployeeId(id));
        result.put("experience", experienceRepo.findByEmployeeId(id));
        result.put("emergencyContacts", emergencyContactRepo.findByEmployeeId(id));
        result.put("passport", passportRepo.findByEmployeeId(id).orElse(null));
        result.put("dependents", dependentRepo.findByEmployeeId(id));
        result.put("assets", assetRepo.findByEmployeeId(id));
        result.put("kyc", kycRepo.findByEmployeeId(id).orElse(null));
        result.put("kycDocuments", kycDocumentRepo.findByEmployeeId(id));
        result.put("activities", activityRepo.findByEmployeeId(id));
        return result;
    }

    public EmployeeMaster createEmployee(EmployeeMaster employee) {
        if (employee.getCreatedDate() == null) {
            employee.setCreatedDate(new Date());
        }
        sanitizeEmployee(employee);
        return employeeRepo.save(employee);
    }

    public EmployeeMaster updateEmployee(Long id, EmployeeMaster details) {
        EmployeeMaster emp = employeeRepo.findById(id).orElse(null);
        if (emp == null) return null;

        // Copy all fields from details, preserving id and audit trail
        details.setId(id);
        details.setCreatedBy(emp.getCreatedBy());
        details.setCreatedDate(emp.getCreatedDate());
        sanitizeEmployee(details);
        return employeeRepo.save(details);
    }

    /** Coerce null Strings to empty string to satisfy NOT NULL DB columns. */
    private void sanitizeEmployee(EmployeeMaster e) {
        if (e.getFatherHusbandName() == null)     e.setFatherHusbandName("");
        if (e.getOldEmpCode() == null)             e.setOldEmpCode("");
        if (e.getGradeCode() == null)              e.setGradeCode("");
        if (e.getProductionLine() == null)         e.setProductionLine("");
        if (e.getEmpClass() == null)               e.setEmpClass("");
        if (e.getTeamGroup() == null)              e.setTeamGroup("");
        if (e.getAdditionalRole() == null)         e.setAdditionalRole("");
        if (e.getExitReason() == null)             e.setExitReason("");
        if (e.getReferMode() == null)              e.setReferMode("");
        if (e.getUserName() == null)               e.setUserName("");
        if (e.getHomeManager() == null)            e.setHomeManager("");
        if (e.getBusinessManager() == null)        e.setBusinessManager("");
        if (e.getSupplierName() == null)           e.setSupplierName("");
        if (e.getProfileUpload() == null)          e.setProfileUpload("");
        if (e.getSignature() == null)              e.setSignature("");
        if (e.getNdaCertificateUpload() == null)   e.setNdaCertificateUpload("");
        if (e.getFitnessCertificateUpload() == null) e.setFitnessCertificateUpload("");
        if (e.getShiftDuration() == null)          e.setShiftDuration("480");
        if (e.getShiftName() == null)              e.setShiftName("GENERAL");
        if (e.getGuest() == null)                  e.setGuest("No");
        if (e.getDailySheetRequired() == null)     e.setDailySheetRequired("No");
        if (e.getAttendanceRequired() == null)     e.setAttendanceRequired("Yes");
        if (e.getShift() == null)                  e.setShift("Yes");
        if (e.getInductionStatus() == null)        e.setInductionStatus("PENDING");
        if (e.getStatus() == null)                 e.setStatus("Active");
        // Ability fields — safe nulls (columns were added nullable in V2.6)
        if (e.getIsAuditor() == null)              e.setIsAuditor("NO");
        if (e.getIsAuditee() == null)              e.setIsAuditee("NO");
        if (e.getIsNcrApprover() == null)          e.setIsNcrApprover("NO");
        if (e.getIsChaired() == null)              e.setIsChaired("NO");
        if (e.getIsHost() == null)                 e.setIsHost("NO");
        if (e.getIsParticipants() == null)         e.setIsParticipants("NO");
        if (e.getIsFirstAid() == null)             e.setIsFirstAid("NO");
        if (e.getIsFireFighter() == null)          e.setIsFireFighter("NO");
        if (e.getIsTwoWheeler() == null)           e.setIsTwoWheeler("NO");
        if (e.getIsFourWheeler() == null)          e.setIsFourWheeler("NO");
        if (e.getIsInductionEligible() == null)    e.setIsInductionEligible("NO");
        if (e.getIsInterviewer() == null)          e.setIsInterviewer("NO");
        if (e.getIsEnquiryAssignee() == null)      e.setIsEnquiryAssignee("NO");
        if (e.getIsPrAssignee() == null)           e.setIsPrAssignee("NO");
    }

    @Transactional
    public void deleteEmployee(Long id) {
        employeeRepo.deleteById(id);
    }

    // ======================== PERSONAL DETAIL ========================

    public EmployeePersonalDetail getPersonalDetail(Long employeeId) {
        return personalRepo.findByEmployeeId(employeeId).orElse(null);
    }

    @Transactional
    public EmployeePersonalDetail savePersonalDetail(Long employeeId, EmployeePersonalDetail detail) {
        if (!employeeRepo.existsById(employeeId)) throw new RuntimeException("Employee not found with ID: " + employeeId);
        detail.setEmployeeId(employeeId);
        EmployeePersonalDetail existing = personalRepo.findByEmployeeId(employeeId).orElse(null);
        if (existing != null) {
            detail.setId(existing.getId());
            detail.setCreatedBy(existing.getCreatedBy());
            detail.setCreatedDate(existing.getCreatedDate());
        }
        return personalRepo.save(detail);
    }

    // ======================== CONTACT ========================

    public EmployeeContact getContact(Long employeeId) {
        return contactRepo.findByEmployeeId(employeeId).orElse(null);
    }

    @Transactional
    public EmployeeContact saveContact(Long employeeId, EmployeeContact contact) {
        if (!employeeRepo.existsById(employeeId)) throw new RuntimeException("Employee not found");
        contact.setEmployeeId(employeeId);
        EmployeeContact existing = contactRepo.findByEmployeeId(employeeId).orElse(null);
        if (existing != null) {
            contact.setId(existing.getId());
            contact.setCreatedBy(existing.getCreatedBy());
            contact.setCreatedDate(existing.getCreatedDate());
        }
        return contactRepo.save(contact);
    }

    // ======================== JOB PROFILE ========================

    public EmployeeJobProfile getJobProfile(Long employeeId) {
        return jobProfileRepo.findByEmployeeId(employeeId).orElse(null);
    }

    @Transactional
    public EmployeeJobProfile saveJobProfile(Long employeeId, EmployeeJobProfile profile) {
        if (!employeeRepo.existsById(employeeId)) throw new RuntimeException("Employee not found");
        profile.setEmployeeId(employeeId);
        EmployeeJobProfile existing = jobProfileRepo.findByEmployeeId(employeeId).orElse(null);
        if (existing != null) {
            profile.setId(existing.getId());
            profile.setCreatedBy(existing.getCreatedBy());
            profile.setCreatedDate(existing.getCreatedDate());
        }
        return jobProfileRepo.save(profile);
    }

    // ======================== EDUCATION (1:N) ========================

    public List<EmployeeEducation> getEducation(Long employeeId) {
        return educationRepo.findByEmployeeId(employeeId);
    }

    @Transactional
    public EmployeeEducation saveEducation(Long employeeId, EmployeeEducation edu) {
        if (!employeeRepo.existsById(employeeId)) throw new RuntimeException("Employee not found");
        edu.setEmployeeId(employeeId);
        return educationRepo.save(edu);
    }

    public void deleteEducation(Long id) {
        educationRepo.deleteById(id);
    }

    // ======================== EXPERIENCE (1:N) ========================

    public List<EmployeeExperience> getExperience(Long employeeId) {
        return experienceRepo.findByEmployeeId(employeeId);
    }

    @Transactional
    public EmployeeExperience saveExperience(Long employeeId, EmployeeExperience exp) {
        if (!employeeRepo.existsById(employeeId)) throw new RuntimeException("Employee not found");
        exp.setEmployeeId(employeeId);
        return experienceRepo.save(exp);
    }

    public void deleteExperience(Long id) {
        experienceRepo.deleteById(id);
    }

    // ======================== EMERGENCY CONTACT (1:N) ========================

    public List<EmployeeEmergencyContact> getEmergencyContacts(Long employeeId) {
        return emergencyContactRepo.findByEmployeeId(employeeId);
    }

    public EmployeeEmergencyContact saveEmergencyContact(Long employeeId, EmployeeEmergencyContact ec) {
        ec.setEmployeeId(employeeId);
        return emergencyContactRepo.save(ec);
    }

    public void deleteEmergencyContact(Long id) {
        emergencyContactRepo.deleteById(id);
    }

    // ======================== PASSPORT ========================

    public EmployeePassport getPassport(Long employeeId) {
        return passportRepo.findByEmployeeId(employeeId).orElse(null);
    }

    public EmployeePassport savePassport(Long employeeId, EmployeePassport passport) {
        passport.setEmployeeId(employeeId);
        EmployeePassport existing = passportRepo.findByEmployeeId(employeeId).orElse(null);
        if (existing != null) {
            passport.setId(existing.getId());
            passport.setCreatedBy(existing.getCreatedBy());
            passport.setCreatedDate(existing.getCreatedDate());
        }
        return passportRepo.save(passport);
    }

    // ======================== DEPENDENT (1:N) ========================

    public List<EmployeeDependent> getDependents(Long employeeId) {
        return dependentRepo.findByEmployeeId(employeeId);
    }

    public EmployeeDependent saveDependent(Long employeeId, EmployeeDependent dep) {
        dep.setEmployeeId(employeeId);
        return dependentRepo.save(dep);
    }

    public void deleteDependent(Long id) {
        dependentRepo.deleteById(id);
    }

    // ======================== ASSET (1:N) ========================

    public List<EmployeeAsset> getAssets(Long employeeId) {
        return assetRepo.findByEmployeeId(employeeId);
    }

    public EmployeeAsset saveAsset(Long employeeId, EmployeeAsset asset) {
        asset.setEmployeeId(employeeId);
        return assetRepo.save(asset);
    }

    public void deleteAsset(Long id) {
        assetRepo.deleteById(id);
    }

    // ======================== KYC ========================

    public EmployeeKyc getKyc(Long employeeId) {
        return kycRepo.findByEmployeeId(employeeId).orElse(null);
    }

    public EmployeeKyc saveKyc(Long employeeId, EmployeeKyc kyc) {
        kyc.setEmployeeId(employeeId);
        EmployeeKyc existing = kycRepo.findByEmployeeId(employeeId).orElse(null);
        if (existing != null) {
            kyc.setId(existing.getId());
            kyc.setCreatedBy(existing.getCreatedBy());
            kyc.setCreatedDate(existing.getCreatedDate());
        }
        return kycRepo.save(kyc);
    }

    // ======================== KYC DOCUMENT (1:N) ========================

    public List<EmployeeKycDocument> getKycDocuments(Long employeeId) {
        return kycDocumentRepo.findByEmployeeId(employeeId);
    }

    public EmployeeKycDocument saveKycDocument(Long employeeId, EmployeeKycDocument doc) {
        doc.setEmployeeId(employeeId);
        return kycDocumentRepo.save(doc);
    }

    public void deleteKycDocument(Long id) {
        kycDocumentRepo.deleteById(id);
    }

    // ======================== ACTIVITY (1:N) ========================

    public List<EmployeeActivity> getActivities(Long employeeId) {
        return activityRepo.findByEmployeeId(employeeId);
    }

    public EmployeeActivity saveActivity(Long employeeId, EmployeeActivity activity) {
        activity.setEmployeeId(employeeId);
        return activityRepo.save(activity);
    }

    public void deleteActivity(Long id) {
        activityRepo.deleteById(id);
    }
}
