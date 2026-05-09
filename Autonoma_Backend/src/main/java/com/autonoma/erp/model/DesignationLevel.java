package com.autonoma.erp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "HRM_DESIG_LEVEL")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DesignationLevel {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "ROW_ID")
	private Long rowId;

	@Column(name = "LEVEL", columnDefinition = "NVARCHAR(10)")
	private String level;

	@Column(name = "BASIC")
	private double basic;

	@Column(name = "DA")
	private double da;

	@Column(name = "HRA")
	private double hra;

	@Column(name = "SCREENING_LEVEL")
	private int screeningLevel;

	@Column(name = "CREATED_BY", nullable = false, columnDefinition = "NVARCHAR(100)")
	private String createdBy;

	@Column(name = "CREATED_DATE")
	@Temporal(TemporalType.TIMESTAMP)
	private Date createdDate;

	@Column(name = "UPDATED_BY", columnDefinition = "NVARCHAR(100)")
	private String updatedBy;

	@Column(name = "UPDATED_DATE")
	@Temporal(TemporalType.TIMESTAMP)
	private Date updatedDate;

	public String getLevel() {
		return level;
	}

	public void setLevel(String level) {
		this.level = level;
	}

	public double getBasic() {
		return basic;
	}

	public void setBasic(double basic) {
		this.basic = basic;
	}

	public double getDa() {
		return da;
	}

	public void setDa(double da) {
		this.da = da;
	}

	public double getHra() {
		return hra;
	}

	public void setHra(double hra) {
		this.hra = hra;
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

	public int getScreeningLevel() {
		return screeningLevel;
	}

	public void setScreeningLevel(int screeningLevel) {
		this.screeningLevel = screeningLevel;
	}

	public Long getRowId() {
		return rowId;
	}

	public void setRowId(Long rowId) {
		this.rowId = rowId;
	}
	
	@PrePersist
	protected void onCreate() {
		createdDate = new Date();
	}

	@PreUpdate
	protected void onUpdate() {
		updatedDate = new Date();
	}

}