package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "ad_company_credential")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private long id;

    @Column(name = "company_name", nullable = false, columnDefinition = "NVARCHAR(100)")
    private String companyName;

    @Column(name = "short_name", columnDefinition = "NVARCHAR(50)")
    private String shortName;

    @Column(name = "address", columnDefinition = "NVARCHAR(500)")
    private String address;

    @Column(name = "city", columnDefinition = "NVARCHAR(50)")
    private String city;

    @Column(name = "state", columnDefinition = "NVARCHAR(50)")
    private String state;

    @Column(name = "state_cd")
    private Integer stateCode;

    @Column(name = "country", columnDefinition = "NVARCHAR(50)")
    private String country;

    @Column(name = "pincode", columnDefinition = "NVARCHAR(10)")
    private String pincode;

    @Column(name = "gst_in", columnDefinition = "NVARCHAR(15)")
    private String gstIn;

    @Column(name = "db_source_name", columnDefinition = "NVARCHAR(50)")
    private String dbSourceName;

    @Column(name = "lic_renewal_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date licRenewalDate;

    @Column(name = "lic_expiry_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date licExpiryDate;

    @Column(name = "logo_file_name", columnDefinition = "NVARCHAR(100)")
    private String logoFileName;

    @Column(name = "login_bg_file_name", columnDefinition = "NVARCHAR(100)")
    private String logInBgFileName;

    @Column(name = "dir_path", columnDefinition = "NVARCHAR(200)")
    private String directoryPath;

    @Column(name = "created_by", columnDefinition = "NVARCHAR(50)")
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "updated_by", columnDefinition = "NVARCHAR(50)")
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @Column(name = "LIC_EXP_REMAINDER_DAYS")
    private long licExpRemainderDays;

    @Column(name = "restore_enable_days")
    private Long restoreEnableDays;

    public long getId() {
        return id;
    }

    public void setId(long id) {
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

    public Long getRestoreEnableDays() {
        return restoreEnableDays;
    }

    public void setRestoreEnableDays(Long restoreEnableDays) {
        this.restoreEnableDays = restoreEnableDays;
    }
}
