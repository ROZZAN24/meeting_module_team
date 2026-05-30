package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "QMS_NCR_OFI_ATTACHMENT")
@Data
public class NcrOfiAttachment extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "NCR_OFI_ID", nullable = false)
    private Integer ncrOfiId;

    @Column(name = "FILE_NAME")
    private String fileName;

    @Column(name = "FILE_PATH", length = 1000)
    private String filePath;

    @Column(name = "FILE_TYPE")
    private String fileType;

    @Column(name = "UPLOADED_BY")
    private String uploadedBy;

    @Column(name = "UPLOADED_DATE")
    private LocalDateTime uploadedDate = LocalDateTime.now();

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
