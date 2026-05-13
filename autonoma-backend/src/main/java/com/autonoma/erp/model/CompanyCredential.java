package com.autonoma.erp.model;

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
    @Column(name = "ID")
    private long id;

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

    @Column(name = "STATE_CD")
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

    @Column(name = "DIR_PATH", columnDefinition = "NVARCHAR(200)")
    private String directoryPath;

    @Column(name = "CREATED_BY", columnDefinition = "NVARCHAR(50)")
    private String createdBy;

    @Column(name = "CREATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "UPDATED_BY", columnDefinition = "NVARCHAR(50)")
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

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
}
