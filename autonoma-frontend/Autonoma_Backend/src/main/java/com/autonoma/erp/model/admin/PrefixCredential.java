package com.autonoma.erp.model.admin;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "ad_prefix_credentials")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrefixCredential {

    @Id
    @Column(name = "account_year", nullable = false, columnDefinition = "VARCHAR(20)")
    private String accountYear;

    @Column(name = "status")
    private Integer status;

    @Column(name = "sales_order_prefix", columnDefinition = "VARCHAR(20)")
    private String salesOrderPrefix;

    @Column(name = "sales_order_suffix", columnDefinition = "VARCHAR(20)")
    private String salesOrderSuffix;

    @Column(name = "sales_order_digit")
    private Integer salesOrderDigit;

    @Column(name = "mat_po_prefix", columnDefinition = "VARCHAR(20)")
    private String matPoPrefix;

    @Column(name = "mat_po_suffix", columnDefinition = "VARCHAR(20)")
    private String matPoSuffix;

    @Column(name = "mat_po_digit")
    private Integer matPoDigit;

    @Column(name = "gate_entry_prefix", columnDefinition = "VARCHAR(20)")
    private String gateEntryPrefix;

    @Column(name = "gate_entry_suffix", columnDefinition = "VARCHAR(20)")
    private String gateEntrySuffix;

    @Column(name = "gate_entry_digit")
    private Integer gateEntryDigit;

    @Column(name = "grn_prefix", columnDefinition = "VARCHAR(20)")
    private String grnPrefix;

    @Column(name = "grn_suffix", columnDefinition = "VARCHAR(20)")
    private String grnSuffix;

    @Column(name = "grn_digit")
    private Integer grnDigit;

    @Column(name = "invoice_prefix", columnDefinition = "VARCHAR(20)")
    private String invoicePrefix;

    @Column(name = "invoice_suffix", columnDefinition = "VARCHAR(20)")
    private String invoiceSuffix;

    @Column(name = "invoice_digit")
    private Integer invoiceDigit;

    @Column(name = "created_by", columnDefinition = "NVARCHAR(100)")
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "updated_by", columnDefinition = "NVARCHAR(100)")
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    // Getters and Setters
    public String getAccountYear() {
        return accountYear;
    }

    public void setAccountYear(String accountYear) {
        this.accountYear = accountYear;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getSalesOrderPrefix() {
        return salesOrderPrefix;
    }

    public void setSalesOrderPrefix(String salesOrderPrefix) {
        this.salesOrderPrefix = salesOrderPrefix;
    }

    public String getSalesOrderSuffix() {
        return salesOrderSuffix;
    }

    public void setSalesOrderSuffix(String salesOrderSuffix) {
        this.salesOrderSuffix = salesOrderSuffix;
    }

    public Integer getSalesOrderDigit() {
        return salesOrderDigit;
    }

    public void setSalesOrderDigit(Integer salesOrderDigit) {
        this.salesOrderDigit = salesOrderDigit;
    }

    public String getMatPoPrefix() {
        return matPoPrefix;
    }

    public void setMatPoPrefix(String matPoPrefix) {
        this.matPoPrefix = matPoPrefix;
    }

    public String getMatPoSuffix() {
        return matPoSuffix;
    }

    public void setMatPoSuffix(String matPoSuffix) {
        this.matPoSuffix = matPoSuffix;
    }

    public Integer getMatPoDigit() {
        return matPoDigit;
    }

    public void setMatPoDigit(Integer matPoDigit) {
        this.matPoDigit = matPoDigit;
    }

    public String getGateEntryPrefix() {
        return gateEntryPrefix;
    }

    public void setGateEntryPrefix(String gateEntryPrefix) {
        this.gateEntryPrefix = gateEntryPrefix;
    }

    public String getGateEntrySuffix() {
        return gateEntrySuffix;
    }

    public void setGateEntrySuffix(String gateEntrySuffix) {
        this.gateEntrySuffix = gateEntrySuffix;
    }

    public Integer getGateEntryDigit() {
        return gateEntryDigit;
    }

    public void setGateEntryDigit(Integer gateEntryDigit) {
        this.gateEntryDigit = gateEntryDigit;
    }

    public String getGrnPrefix() {
        return grnPrefix;
    }

    public void setGrnPrefix(String grnPrefix) {
        this.grnPrefix = grnPrefix;
    }

    public String getGrnSuffix() {
        return grnSuffix;
    }

    public void setGrnSuffix(String grnSuffix) {
        this.grnSuffix = grnSuffix;
    }

    public Integer getGrnDigit() {
        return grnDigit;
    }

    public void setGrnDigit(Integer grnDigit) {
        this.grnDigit = grnDigit;
    }

    public String getInvoicePrefix() {
        return invoicePrefix;
    }

    public void setInvoicePrefix(String invoicePrefix) {
        this.invoicePrefix = invoicePrefix;
    }

    public String getInvoiceSuffix() {
        return invoiceSuffix;
    }

    public void setInvoiceSuffix(String invoiceSuffix) {
        this.invoiceSuffix = invoiceSuffix;
    }

    public Integer getInvoiceDigit() {
        return invoiceDigit;
    }

    public void setInvoiceDigit(Integer invoiceDigit) {
        this.invoiceDigit = invoiceDigit;
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
}
