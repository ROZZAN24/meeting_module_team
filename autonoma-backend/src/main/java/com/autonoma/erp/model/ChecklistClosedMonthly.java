package com.autonoma.erp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "QMS_CHECKLIST_CLOSED_MONTHLY")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChecklistClosedMonthly extends BaseChecklistClosedEntity {
}
