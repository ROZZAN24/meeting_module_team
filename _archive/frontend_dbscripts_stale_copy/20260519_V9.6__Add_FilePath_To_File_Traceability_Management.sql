-- V9.6 Add file_path column to file_traceability_management
-- Standard Flyway Migration

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('file_traceability_management') 
    AND name = 'file_path'
)
BEGIN
    ALTER TABLE file_traceability_management ADD file_path NVARCHAR(500) NULL;
END;
GO
