-- =============================================
-- Author:      Antigravity
-- Create date: 2026-05-24
-- Description: Create missing qms_checklist_department table for checklist mapping
-- =============================================

IF OBJECT_ID('dbo.qms_checklist_department', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.qms_checklist_department (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        CHECKLIST_ID BIGINT NOT NULL,
        DEPARTMENT_NAME NVARCHAR(100) NOT NULL,
        CONSTRAINT FK_Dept_Checklist_Master FOREIGN KEY (CHECKLIST_ID) REFERENCES dbo.qms_checklist_master(id) ON DELETE CASCADE
    );
END
GO
