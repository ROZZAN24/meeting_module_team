package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "sm_contact_master")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_name", length = 200)
    private String groupName; // This is often the Customer Name

    @Column(name = "title", length = 20)
    private String title;

    @Column(name = "contact_name", nullable = false, length = 200)
    private String contactName;

    @Column(name = "designation", length = 100)
    private String designation;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "email_id", length = 100)
    private String emailId;

    @Column(name = "landline_no", length = 50)
    private String landlineNo;

    @Column(name = "mobile_no", length = 50)
    private String mobileNo;

    @Column(name = "whatsapp_no", length = 50)
    private String whatsAppNo;

    @Column(name = "file_upload", length = 500)
    private String fileUpload;

    @Column(name = "STATUS")
    @Builder.Default
    private String status = "Active";

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}
