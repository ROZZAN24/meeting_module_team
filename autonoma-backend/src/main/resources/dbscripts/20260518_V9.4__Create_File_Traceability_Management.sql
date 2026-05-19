-- V9.4 Create File Traceability Management Table
-- Standard Flyway Migration

IF OBJECT_ID('file_traceability_management', 'U') IS NULL
BEGIN
    CREATE TABLE file_traceability_management (
        row_id INT IDENTITY(1,1) PRIMARY KEY,
        page_id INT NULL,
        page_name NVARCHAR(200) NULL,
        report_name NVARCHAR(200) NULL,
        created_by NVARCHAR(100) NOT NULL,
        created_at DATETIME NULL,
        updated_by NVARCHAR(100) NULL,
        updated_at DATETIME NULL,
        CONSTRAINT FK_file_traceability_page FOREIGN KEY (page_id) REFERENCES bos_pages(page_id)
    );
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_FILE_TRACEABILITY_PAGE' AND object_id = OBJECT_ID('file_traceability_management'))
BEGIN
    CREATE INDEX IDX_FILE_TRACEABILITY_PAGE ON file_traceability_management(page_id);
END;
GO
