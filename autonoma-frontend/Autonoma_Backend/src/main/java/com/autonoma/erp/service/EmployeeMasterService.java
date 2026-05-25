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

    public List<EmployeeMaster> getActiveEmployees() {
        return employeeRepo.findByStatus("Active");
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

    public String getNextEmpCode() {
        return employeeRepo.findFirstByOrderByEmpCodeDesc()
                .map(latest -> incrementSequence(latest.getEmpCode(), "EMP-"))
                .orElse("EMP-001");
    }

    public EmployeeMaster createEmployee(EmployeeMaster employee) {
        if (employee.getEmpCode() != null && !employee.getEmpCode().trim().isEmpty()) {
            if (employeeRepo.existsByEmpCode(employee.getEmpCode())) {
                throw new RuntimeException("Employee Code already exists!");
            }
        }
        
        if (employee.getCreatedAt() == null) {
            employee.setCreatedAt(new Date());
        }
        employee.setUpdatedAt(new Date());
        
        if (employee.getCreatedBy() == null) {
            employee.setCreatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
        }
        employee.setUpdatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
        
        // Auto-generate empCode if missing
        if (employee.getEmpCode() == null || employee.getEmpCode().trim().isEmpty()) {
            String nextCode = employeeRepo.findFirstByOrderByEmpCodeDesc()
                    .map(latest -> incrementSequence(latest.getEmpCode(), "EMP-"))
                    .orElse("001");
            employee.setEmpCode(nextCode);
        }
        
        sanitizeEmployee(employee);
        return employeeRepo.save(employee);
    }

    public EmployeeMaster updateEmployee(Long id, EmployeeMaster details) {
        if (details.getEmpCode() != null && !details.getEmpCode().trim().isEmpty()) {
            if (employeeRepo.existsByEmpCodeAndIdNot(details.getEmpCode(), id)) {
                throw new RuntimeException("Employee Code already exists!");
            }
        }

        EmployeeMaster emp = employeeRepo.findById(id).orElse(null);
        if (emp == null) return null;

        // Copy all fields from details, preserving id and audit trail
        details.setId(id);
        if (details.getCreatedBy() == null) details.setCreatedBy(emp.getCreatedBy());
        if (details.getCreatedAt() == null) details.setCreatedAt(emp.getCreatedAt());
        
        details.setUpdatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
        details.setUpdatedAt(new Date());
        
        sanitizeEmployee(details);
        return employeeRepo.save(details);
    }

    /** Coerce null Strings to empty string to satisfy NOT NULL DB columns. */
    private void sanitizeEmployee(EmployeeMaster e) {
        if (e.getEmpCode() == null)                e.setEmpCode("");
        if (e.getFatherHusbandName() == null)     e.setFatherHusbandName("");
        if (e.getGradeCode() == null)              e.setGradeCode("");
        if (e.getExitReason() == null)             e.setExitReason("");
        if (e.getReferMode() == null)              e.setReferMode("");
        if (e.getHomeManager() == null)            e.setHomeManager("");
        if (e.getBusinessManager() == null)        e.setBusinessManager("");
        if (e.getSupplierName() == null)           e.setSupplierName("");
        if (e.getEmployeePhotoUpload() == null)    e.setEmployeePhotoUpload("");
        if (e.getEmployeeSignatureUpload() == null) e.setEmployeeSignatureUpload("");
        if (e.getNdaUpload() == null)              e.setNdaUpload("");
        if (e.getFitnessCertificateUpload() == null) e.setFitnessCertificateUpload("");
        if (e.getShiftDuration() == null)          e.setShiftDuration("480");
        if (e.getShiftName() == null)              e.setShiftName("GENERAL");
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

    private String incrementSequence(String latest, String prefix) {
        if (latest == null || latest.isEmpty()) return "001";
        try {
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\d+$");
            java.util.regex.Matcher matcher = pattern.matcher(latest.trim());
            if (matcher.find()) {
                String numericPart = matcher.group();
                int num = Integer.parseInt(numericPart);
                int length = Math.max(numericPart.length(), 3);
                String nextNum = String.format("%0" + length + "d", num + 1);
                return latest.substring(0, matcher.start()).trim() + nextNum;
            }
            return prefix + "001";
        } catch (Exception ex) {
            return prefix + "001";
        }
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
        
        EmployeePersonalDetail existing = personalRepo.findByEmployeeId(employeeId).orElse(new EmployeePersonalDetail());
        if (existing.getId() == null) {
            existing.setEmployeeId(employeeId);
            existing.setCreatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
        }

        // Merge fields (Personal Details + ID Details)
        if (detail.getGender() != null) existing.setGender(detail.getGender());
        if (detail.getMaritalStatus() != null) existing.setMaritalStatus(detail.getMaritalStatus());
        if (detail.getMarriageDate() != null) existing.setMarriageDate(detail.getMarriageDate());
        if (detail.getBirthDate() != null) existing.setBirthDate(detail.getBirthDate());
        if (detail.getNationality() != null) existing.setNationality(detail.getNationality());
        if (detail.getPersonalEmail() != null) existing.setPersonalEmail(detail.getPersonalEmail());
        if (detail.getBloodGroup() != null) existing.setBloodGroup(detail.getBloodGroup());
        if (detail.getRegion() != null) existing.setRegion(detail.getRegion());
        if (detail.getShirtSize() != null) existing.setShirtSize(detail.getShirtSize());
        if (detail.getPantSize() != null) existing.setPantSize(detail.getPantSize());
        if (detail.getShoeSize() != null) existing.setShoeSize(detail.getShoeSize());
        if (detail.getHeight() != null) existing.setHeight(detail.getHeight());
        if (detail.getWeight() != null) existing.setWeight(detail.getWeight());
        
        // ID Details
        if (detail.getAadharNumber() != null) existing.setAadharNumber(detail.getAadharNumber());
        if (detail.getDrivingLicenseNumber() != null) existing.setDrivingLicenseNumber(detail.getDrivingLicenseNumber());
        if (detail.getPassportNumber() != null) existing.setPassportNumber(detail.getPassportNumber());
        if (detail.getPassportIssueCity() != null) existing.setPassportIssueCity(detail.getPassportIssueCity());
        if (detail.getLicenseExpiryDate() != null) existing.setLicenseExpiryDate(detail.getLicenseExpiryDate());

        existing.setUpdatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
        existing.setUpdatedDate(new Date());
        return personalRepo.save(existing);
    }

    // ======================== CONTACT ========================

    public EmployeeContact getContact(Long employeeId) {
        return contactRepo.findByEmployeeId(employeeId).orElse(null);
    }

    @Transactional
    public EmployeeContact saveContact(Long employeeId, EmployeeContact contact) {
        if (!employeeRepo.existsById(employeeId)) throw new RuntimeException("Employee not found");
        
        EmployeeContact existing = contactRepo.findByEmployeeId(employeeId).orElse(new EmployeeContact());
        if (existing.getId() == null) {
            existing.setEmployeeId(employeeId);
            existing.setCreatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
        }

        if (contact.getAddress() != null) existing.setAddress(contact.getAddress());
        if (contact.getCity() != null) existing.setCity(contact.getCity());
        if (contact.getState() != null) existing.setState(contact.getState());
        if (contact.getCountry() != null) existing.setCountry(contact.getCountry());
        if (contact.getPincode() != null) existing.setPincode(contact.getPincode());
        if (contact.getMobile() != null) existing.setMobile(contact.getMobile());
        if (contact.getAlternateMobile() != null) existing.setAlternateMobile(contact.getAlternateMobile());

        existing.setUpdatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
        existing.setUpdatedDate(new Date());
        return contactRepo.save(existing);
    }

    // ======================== JOB PROFILE ========================

    public EmployeeJobProfile getJobProfile(Long employeeId) {
        return jobProfileRepo.findByEmployeeId(employeeId).orElse(null);
    }

    @Transactional
    public EmployeeJobProfile saveJobProfile(Long employeeId, EmployeeJobProfile profile) {
        if (!employeeRepo.existsById(employeeId)) throw new RuntimeException("Employee not found");
        
        EmployeeJobProfile existing = jobProfileRepo.findByEmployeeId(employeeId).orElse(new EmployeeJobProfile());
        if (existing.getId() == null) {
            existing.setEmployeeId(employeeId);
            existing.setCreatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
        }

        // Merge Bank Details
        if (profile.getSalaryAccountNumber() != null) existing.setSalaryAccountNumber(profile.getSalaryAccountNumber());
        if (profile.getAccountName() != null) existing.setAccountName(profile.getAccountName());
        if (profile.getBankAccountType() != null) existing.setBankAccountType(profile.getBankAccountType());
        if (profile.getBankName() != null) existing.setBankName(profile.getBankName());
        if (profile.getIfscCode() != null) existing.setIfscCode(profile.getIfscCode());
        if (profile.getBranchName() != null) existing.setBranchName(profile.getBranchName());

        // Merge Pay Components
        if (profile.getGrossSalary() != null) existing.setGrossSalary(profile.getGrossSalary());
        if (profile.getNetSalary() != null) existing.setNetSalary(profile.getNetSalary());
        if (profile.getBasicSalary() != null) existing.setBasicSalary(profile.getBasicSalary());
        if (profile.getDa() != null) existing.setDa(profile.getDa());
        if (profile.getHra() != null) existing.setHra(profile.getHra());
        if (profile.getSpecialAllowance() != null) existing.setSpecialAllowance(profile.getSpecialAllowance());
        if (profile.getPerformanceIncentive() != null) existing.setPerformanceIncentive(profile.getPerformanceIncentive());
        if (profile.getCanteenDeduction() != null) existing.setCanteenDeduction(profile.getCanteenDeduction());
        if (profile.getPfType() != null) existing.setPfType(profile.getPfType());
        if (profile.getPfEmployee() != null) existing.setPfEmployee(profile.getPfEmployee());
        if (profile.getEsiEmployee() != null) existing.setEsiEmployee(profile.getEsiEmployee());
        if (profile.getProfessionalTaxAmount() != null) existing.setProfessionalTaxAmount(profile.getProfessionalTaxAmount());
        if (profile.getPfDocument() != null) existing.setPfDocument(profile.getPfDocument());

        // Merge CTC Details
        if (profile.getMonthlyCtc() != null) existing.setMonthlyCtc(profile.getMonthlyCtc());
        if (profile.getBasicSalaryCtc() != null) existing.setBasicSalaryCtc(profile.getBasicSalaryCtc());
        if (profile.getDaCtc() != null) existing.setDaCtc(profile.getDaCtc());
        if (profile.getSpecialAllowanceCtc() != null) existing.setSpecialAllowanceCtc(profile.getSpecialAllowanceCtc());
        if (profile.getCanteenAllowance() != null) existing.setCanteenAllowance(profile.getCanteenAllowance());
        if (profile.getPerformanceIncentiveCtc() != null) existing.setPerformanceIncentiveCtc(profile.getPerformanceIncentiveCtc());
        if (profile.getEsiCtc() != null) existing.setEsiCtc(profile.getEsiCtc());
        if (profile.getPfCtc() != null) existing.setPfCtc(profile.getPfCtc());
        if (profile.getGrossCtc() != null) existing.setGrossCtc(profile.getGrossCtc());
        if (profile.getEmployerPf() != null) existing.setEmployerPf(profile.getEmployerPf());
        if (profile.getEmployerEsi() != null) existing.setEmployerEsi(profile.getEmployerEsi());
        if (profile.getUniformAllowance() != null) existing.setUniformAllowance(profile.getUniformAllowance());
        if (profile.getShoeAllowance() != null) existing.setShoeAllowance(profile.getShoeAllowance());
        if (profile.getMobileAllowanceCug() != null) existing.setMobileAllowanceCug(profile.getMobileAllowanceCug());
        if (profile.getAnnualCtc() != null) existing.setAnnualCtc(profile.getAnnualCtc());
        if (profile.getSalaryCtc() != null) existing.setSalaryCtc(profile.getSalaryCtc());
        if (profile.getGratuity() != null) existing.setGratuity(profile.getGratuity());
        if (profile.getBonus() != null) existing.setBonus(profile.getBonus());
        if (profile.getSpecialIncentive() != null) existing.setSpecialIncentive(profile.getSpecialIncentive());
        if (profile.getPerformanceLinkedIncentive() != null) existing.setPerformanceLinkedIncentive(profile.getPerformanceLinkedIncentive());
        if (profile.getHealthInsurance() != null) existing.setHealthInsurance(profile.getHealthInsurance());

        existing.setUpdatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
        existing.setUpdatedDate(new Date());
        return jobProfileRepo.save(existing);
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
