package com.autonoma.erp.model.admin;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "AD_COMPANY_CREDENTIAL")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "COMPANY_NAME", nullable = false, columnDefinition = "NVARCHAR(100)")
    private String companyName;

    @Column(name = "SHORT_NAME", columnDefinition = "NVARCHAR(50)")
    private String shortName;

    @Column(name = "ADDRESS", columnDefinition = "NVARCHAR(500)")
    private String address;

    @Column(name = "CITY", columnDefinition = "NVARCHAR(50)")
    private String city;

    @Column(name = "STATE", columnDefinition = "NVARCHAR(50)")
    private String state;

    @Column(name = "STATE_CODE")
    private Integer stateCode;

    @Column(name = "COUNTRY", columnDefinition = "NVARCHAR(50)")
    private String country;

    @Column(name = "PINCODE", columnDefinition = "NVARCHAR(10)")
    private String pincode;

    @Column(name = "GST_IN", columnDefinition = "NVARCHAR(15)")
    private String gstIn;

    @Column(name = "DB_SOURCE_NAME", columnDefinition = "NVARCHAR(50)")
    private String dbSourceName;

    @Column(name = "LIC_RENEWAL_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date licRenewalDate;

    @Column(name = "LIC_EXPIRY_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date licExpiryDate;

    @Column(name = "LOGO_FILE_NAME", columnDefinition = "NVARCHAR(100)")
    private String logoFileName;

    @Column(name = "LOGIN_BG_FILE_NAME", columnDefinition = "NVARCHAR(100)")
    private String logInBgFileName;

    @Column(name = "DIRECTORY_PATH", columnDefinition = "NVARCHAR(1000)")
    private String directoryPath;

    @Column(name = "CREATED_BY", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "CREATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @Column(name = "LIC_EXP_REMAINDER_DAYS")
    private long licExpRemainderDays;

    @Column(name = "RESTORE_ENABLE_DAYS")
    private Integer restoreEnableDays;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @Column(name = "INPUT_CASE_STYLE", columnDefinition = "NVARCHAR(50)")
    private String inputCaseStyle;

    @Column(name = "REGISTRATION_NO", columnDefinition = "NVARCHAR(100)")
    private String registrationNo;

    @Column(name = "PAN_NO", columnDefinition = "NVARCHAR(50)")
    private String panNo;

    @Column(name = "MOBILE_NO", columnDefinition = "NVARCHAR(20)")
    private String mobileNo;

    @Column(name = "PHONE_NO", columnDefinition = "NVARCHAR(20)")
    private String phoneNo;

    @Column(name = "EMAIL_ID", columnDefinition = "NVARCHAR(100)")
    private String emailId;

    @Column(name = "WEBSITE", columnDefinition = "NVARCHAR(100)")
    private String website;

    @Column(name = "GMAPLINK", columnDefinition = "NVARCHAR(500)")
    private String gmaplink;

    @Column(name = "DECIMAL_PLACES")
    private Integer decimalPlaces;

    @Column(name = "CURRENCY_CODE", columnDefinition = "NVARCHAR(10)")
    private String currencyCode;

    @Column(name = "SMTP_HOST", columnDefinition = "NVARCHAR(100)")
    private String smtpHost;

    @Column(name = "SMTP_PORT")
    private Integer smtpPort;

    @Column(name = "SMTP_USERNAME", columnDefinition = "NVARCHAR(100)")
    private String smtpUsername;

    @Column(name = "SMTP_PASSWORD", columnDefinition = "NVARCHAR(255)")
    private String smtpPassword;

    @Column(name = "SMTP_SSL_ENABLED")
    private Boolean smtpSslEnabled;

    @Column(name = "SUPPORT_EMAIL", columnDefinition = "NVARCHAR(100)")
    private String supportEmail;

    @Column(name = "SUPPORT_PHONE", columnDefinition = "NVARCHAR(20)")
    private String supportPhone;

    @Column(name = "AUDIT_LOG_ENABLED")
    private Boolean auditLogEnabled;

    @PrePersist
    protected void onCreate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.createdBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        this.updatedBy = null;

        createdDate = new Date();
        if (createdBy == null || createdBy.isEmpty()) createdBy = "Admin";
        if (isActive == null) isActive = true;
        }

    @PreUpdate
    protected void onUpdate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.updatedBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        if (this.createdBy != null && this.createdBy.trim().isEmpty()) { this.createdBy = null; }

        updatedDate = new Date();
        if (updatedBy == null || updatedBy.isEmpty()) updatedBy = "Admin";
        }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getShortName() {
        return shortName;
    }

    public void setShortName(String shortName) {
        this.shortName = shortName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Integer getStateCode() {
        return stateCode;
    }

    public void setStateCode(Integer stateCode) {
        this.stateCode = stateCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getGstIn() {
        return gstIn;
    }

    public void setGstIn(String gstIn) {
        this.gstIn = gstIn;
    }

    public String getDbSourceName() {
        return dbSourceName;
    }

    public void setDbSourceName(String dbSourceName) {
        this.dbSourceName = dbSourceName;
    }

    public Date getLicRenewalDate() {
        return licRenewalDate;
    }

    public void setLicRenewalDate(Date licRenewalDate) {
        this.licRenewalDate = licRenewalDate;
    }

    public Date getLicExpiryDate() {
        return licExpiryDate;
    }

    public void setLicExpiryDate(Date licExpiryDate) {
        this.licExpiryDate = licExpiryDate;
    }

    public String getLogoFileName() {
        return logoFileName;
    }

    public void setLogoFileName(String logoFileName) {
        this.logoFileName = logoFileName;
    }

    public String getLogInBgFileName() {
        return logInBgFileName;
    }

    public void setLogInBgFileName(String logInBgFileName) {
        this.logInBgFileName = logInBgFileName;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Date getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public Date getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(Date updatedDate) {
        this.updatedDate = updatedDate;
    }

    public String getDirectoryPath() {
        return directoryPath;
    }

    public void setDirectoryPath(String directoryPath) {
        this.directoryPath = directoryPath;
    }

    public long getLicExpRemainderDays() {
        return licExpRemainderDays;
    }

    public void setLicExpRemainderDays(long licExpRemainderDays) {
        this.licExpRemainderDays = licExpRemainderDays;
    }

    public Integer getRestoreEnableDays() {
        return restoreEnableDays;
    }

    public void setRestoreEnableDays(Integer restoreEnableDays) {
        this.restoreEnableDays = restoreEnableDays;
    }

    public String getInputCaseStyle() {
        return inputCaseStyle;
    }

    public void setInputCaseStyle(String inputCaseStyle) {
        this.inputCaseStyle = inputCaseStyle;
    }

    public String getRegistrationNo() {
        return registrationNo;
    }

    public void setRegistrationNo(String registrationNo) {
        this.registrationNo = registrationNo;
    }

    public String getPanNo() {
        return panNo;
    }

    public void setPanNo(String panNo) {
        this.panNo = panNo;
    }

    public String getMobileNo() {
        return mobileNo;
    }

    public void setMobileNo(String mobileNo) {
        this.mobileNo = mobileNo;
    }

    public String getPhoneNo() {
        return phoneNo;
    }

    public void setPhoneNo(String phoneNo) {
        this.phoneNo = phoneNo;
    }

    public String getEmailId() {
        return emailId;
    }

    public void setEmailId(String emailId) {
        this.emailId = emailId;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getGmaplink() {
        return gmaplink;
    }

    public void setGmaplink(String gmaplink) {
        this.gmaplink = gmaplink;
    }

    public Integer getDecimalPlaces() {
        return decimalPlaces;
    }

    public void setDecimalPlaces(Integer decimalPlaces) {
        this.decimalPlaces = decimalPlaces;
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public void setCurrencyCode(String currencyCode) {
        this.currencyCode = currencyCode;
    }

    public String getSmtpHost() {
        return smtpHost;
    }

    public void setSmtpHost(String smtpHost) {
        this.smtpHost = smtpHost;
    }

    public Integer getSmtpPort() {
        return smtpPort;
    }

    public void setSmtpPort(Integer smtpPort) {
        this.smtpPort = smtpPort;
    }

    public String getSmtpUsername() {
        return smtpUsername;
    }

    public void setSmtpUsername(String smtpUsername) {
        this.smtpUsername = smtpUsername;
    }

    public String getSmtpPassword() {
        return smtpPassword;
    }

    public void setSmtpPassword(String smtpPassword) {
        this.smtpPassword = smtpPassword;
    }

    public Boolean getSmtpSslEnabled() {
        return smtpSslEnabled;
    }

    public void setSmtpSslEnabled(Boolean smtpSslEnabled) {
        this.smtpSslEnabled = smtpSslEnabled;
    }

    public String getSupportEmail() {
        return supportEmail;
    }

    public void setSupportEmail(String supportEmail) {
        this.supportEmail = supportEmail;
    }

    public String getSupportPhone() {
        return supportPhone;
    }

    public void setSupportPhone(String supportPhone) {
        this.supportPhone = supportPhone;
    }

    public Boolean getAuditLogEnabled() {
        return auditLogEnabled;
    }

    public void setAuditLogEnabled(Boolean auditLogEnabled) {
        this.auditLogEnabled = auditLogEnabled;
    }
}
