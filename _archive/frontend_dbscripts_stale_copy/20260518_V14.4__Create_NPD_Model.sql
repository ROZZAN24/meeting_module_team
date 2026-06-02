-- V14.4 Create NPD Model Master Table
-- Standard Flyway Migration

IF OBJECT_ID('npd_model', 'U') IS NULL
BEGIN
    CREATE TABLE npd_model (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        oem_id BIGINT NOT NULL,
        model_no NVARCHAR(100) NOT NULL UNIQUE,
        rotor_diameter DECIMAL(10,2) NOT NULL DEFAULT 0.0,
        status NVARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
        created_by NVARCHAR(100) NULL,
        created_at DATETIME NULL,
        updated_by NVARCHAR(100) NULL,
        updated_at DATETIME NULL,
        CONSTRAINT fk_npd_model_oem FOREIGN KEY (oem_id) REFERENCES npd_oem(id)
    );
END;
GO
