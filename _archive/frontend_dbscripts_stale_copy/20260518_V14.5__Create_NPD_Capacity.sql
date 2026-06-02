-- V14.5 Create NPD Capacity Master Table
-- Standard Flyway Migration

IF OBJECT_ID('npd_capacity', 'U') IS NULL
BEGIN
    CREATE TABLE npd_capacity (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        model_id BIGINT NOT NULL,
        uom NVARCHAR(20) NOT NULL,
        capacity_val DECIMAL(10,2) NOT NULL,
        created_by NVARCHAR(100) NULL,
        created_at DATETIME NULL,
        updated_by NVARCHAR(100) NULL,
        updated_at DATETIME NULL,
        CONSTRAINT fk_npd_capacity_model FOREIGN KEY (model_id) REFERENCES npd_model(id),
        CONSTRAINT uq_npd_capacity UNIQUE (model_id, uom, capacity_val)
    );
END;
GO
