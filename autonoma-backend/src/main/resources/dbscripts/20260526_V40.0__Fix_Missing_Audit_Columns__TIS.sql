-- ============================================================
-- V40.0 Fix Missing Audit Columns & Create Error Log Table
-- Patch for: qms_checklist_assignment, QMS_AUDIT_ATTENDANCE,
--            QMS_NCR_OFI_MASTER, qms_master_checklist, and more
-- ============================================================
USE [AUTONOMA];
GO

-- ===========================================================
-- STEP 1: Create ad_backend_error_log on SQL Server if missing
-- ===========================================================
IF OBJECT_ID('ad_backend_error_log', 'U') IS NULL
BEGIN
    CREATE TABLE ad_backend_error_log (
        id              BIGINT IDENTITY(1,1) PRIMARY KEY,
        module_name     NVARCHAR(255) NULL,
        api_endpoint    NVARCHAR(255) NULL,
        exception_type  NVARCHAR(255) NULL,
        error_message   NVARCHAR(MAX) NULL,
        error_stack     NVARCHAR(MAX) NULL,
        username        NVARCHAR(255) NULL,
        timestamp       DATETIME NULL,
        sql_table_name  NVARCHAR(255) NULL,
        sql_field_name  NVARCHAR(255) NULL,
        http_method     NVARCHAR(50) NULL,
        request_path    NVARCHAR(255) NULL,
        server_response_status INT NULL
    );
    PRINT 'Created ad_backend_error_log';
END
GO

-- ===========================================================
-- Helper: Safe column rename
-- ===========================================================
IF OBJECT_ID('dbo.sp_RenameColSafe', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_RenameColSafe;
GO
CREATE PROCEDURE dbo.sp_RenameColSafe
    @tbl NVARCHAR(200), @old NVARCHAR(100), @new NVARCHAR(100)
AS
BEGIN
    IF OBJECT_ID(@tbl) IS NULL RETURN;
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@tbl) AND name = @old)
       AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@tbl) AND name = @new)
    BEGIN
        DECLARE @full NVARCHAR(300) = @tbl + '.' + @old;
        EXEC sp_rename @full, @new, 'COLUMN';
    END
END
GO

-- ===========================================================
-- Helper: Safe column add
-- ===========================================================
IF OBJECT_ID('dbo.sp_AddColSafe', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_AddColSafe;
GO
CREATE PROCEDURE dbo.sp_AddColSafe
    @tbl NVARCHAR(200), @col NVARCHAR(100), @def NVARCHAR(250)
AS
BEGIN
    IF OBJECT_ID(@tbl) IS NULL RETURN;
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@tbl) AND name = @col)
    BEGIN
        DECLARE @sql NVARCHAR(MAX) = 'ALTER TABLE ' + QUOTENAME(@tbl) + ' ADD ' + QUOTENAME(@col) + ' ' + @def;
        EXEC(@sql);
    END
END
GO

-- ===========================================================
-- STEP 2: Rename old-style columns -> standardized names
--         For any table that still has UPDATED_AT / UPDATED_BY
-- ===========================================================

-- qms_checklist_assignment (still lowercase - rename wasn't applied because table name differed)
EXEC dbo.sp_RenameColSafe 'qms_checklist_assignment', 'UPDATED_AT',  'UPDATED_DATE';
EXEC dbo.sp_RenameColSafe 'qms_checklist_assignment', 'UPDATED_BY',  'UPDATED_USER';
EXEC dbo.sp_RenameColSafe 'qms_checklist_assignment', 'updated_at',  'UPDATED_DATE';
EXEC dbo.sp_RenameColSafe 'qms_checklist_assignment', 'updated_by',  'UPDATED_USER';
EXEC dbo.sp_RenameColSafe 'qms_checklist_assignment', 'created_at',  'CREATED_DATE';
EXEC dbo.sp_RenameColSafe 'qms_checklist_assignment', 'created_by',  'CREATED_USER';

-- QMS_AUDIT_ATTENDANCE
EXEC dbo.sp_RenameColSafe 'QMS_AUDIT_ATTENDANCE', 'UPDATED_AT',  'UPDATED_DATE';
EXEC dbo.sp_RenameColSafe 'QMS_AUDIT_ATTENDANCE', 'UPDATED_BY',  'UPDATED_USER';
EXEC dbo.sp_RenameColSafe 'QMS_AUDIT_ATTENDANCE', 'updated_at',  'UPDATED_DATE';
EXEC dbo.sp_RenameColSafe 'QMS_AUDIT_ATTENDANCE', 'updated_by',  'UPDATED_USER';
EXEC dbo.sp_RenameColSafe 'QMS_AUDIT_ATTENDANCE', 'created_at',  'CREATED_DATE';
EXEC dbo.sp_RenameColSafe 'QMS_AUDIT_ATTENDANCE', 'created_by',  'CREATED_USER';

-- QMS_NCR_OFI_MASTER
EXEC dbo.sp_RenameColSafe 'QMS_NCR_OFI_MASTER', 'UPDATED_AT',  'UPDATED_DATE';
EXEC dbo.sp_RenameColSafe 'QMS_NCR_OFI_MASTER', 'UPDATED_BY',  'UPDATED_USER';
EXEC dbo.sp_RenameColSafe 'QMS_NCR_OFI_MASTER', 'updated_at',  'UPDATED_DATE';
EXEC dbo.sp_RenameColSafe 'QMS_NCR_OFI_MASTER', 'updated_by',  'UPDATED_USER';
EXEC dbo.sp_RenameColSafe 'QMS_NCR_OFI_MASTER', 'created_at',  'CREATED_DATE';
EXEC dbo.sp_RenameColSafe 'QMS_NCR_OFI_MASTER', 'created_by',  'CREATED_USER';

-- qms_master_checklist (different from qms_checklist_master)
EXEC dbo.sp_RenameColSafe 'qms_master_checklist', 'UPDATED_AT',  'UPDATED_DATE';
EXEC dbo.sp_RenameColSafe 'qms_master_checklist', 'UPDATED_BY',  'UPDATED_USER';
EXEC dbo.sp_RenameColSafe 'qms_master_checklist', 'updated_at',  'UPDATED_DATE';
EXEC dbo.sp_RenameColSafe 'qms_master_checklist', 'updated_by',  'UPDATED_USER';
EXEC dbo.sp_RenameColSafe 'qms_master_checklist', 'created_at',  'CREATED_DATE';
EXEC dbo.sp_RenameColSafe 'qms_master_checklist', 'created_by',  'CREATED_USER';
GO

-- ===========================================================
-- STEP 3: Add any still-missing audit columns
-- ===========================================================

-- qms_checklist_assignment: add UPDATED_DATE / UPDATED_USER if still missing
EXEC dbo.sp_AddColSafe 'qms_checklist_assignment', 'UPDATED_DATE', 'DATETIME';
EXEC dbo.sp_AddColSafe 'qms_checklist_assignment', 'UPDATED_USER', 'NVARCHAR(100)';
EXEC dbo.sp_AddColSafe 'qms_checklist_assignment', 'CREATED_DATE', 'DATETIME DEFAULT GETDATE()';
EXEC dbo.sp_AddColSafe 'qms_checklist_assignment', 'CREATED_USER', 'NVARCHAR(100)';

-- QMS_AUDIT_ATTENDANCE: add CREATED_USER / UPDATED_USER if missing
EXEC dbo.sp_AddColSafe 'QMS_AUDIT_ATTENDANCE', 'CREATED_USER', 'NVARCHAR(100)';
EXEC dbo.sp_AddColSafe 'QMS_AUDIT_ATTENDANCE', 'UPDATED_USER', 'NVARCHAR(100)';
EXEC dbo.sp_AddColSafe 'QMS_AUDIT_ATTENDANCE', 'CREATED_DATE', 'DATETIME DEFAULT GETDATE()';
EXEC dbo.sp_AddColSafe 'QMS_AUDIT_ATTENDANCE', 'UPDATED_DATE', 'DATETIME';

-- QMS_NCR_OFI_MASTER: add all four if missing
EXEC dbo.sp_AddColSafe 'QMS_NCR_OFI_MASTER', 'CREATED_DATE', 'DATETIME DEFAULT GETDATE()';
EXEC dbo.sp_AddColSafe 'QMS_NCR_OFI_MASTER', 'CREATED_USER', 'NVARCHAR(100)';
EXEC dbo.sp_AddColSafe 'QMS_NCR_OFI_MASTER', 'UPDATED_DATE', 'DATETIME';
EXEC dbo.sp_AddColSafe 'QMS_NCR_OFI_MASTER', 'UPDATED_USER', 'NVARCHAR(100)';

-- QMS_NCR_OFI_ACTION: add CREATED_DATE if missing
EXEC dbo.sp_AddColSafe 'QMS_NCR_OFI_ACTION', 'CREATED_DATE', 'DATETIME DEFAULT GETDATE()';

-- qms_master_checklist
EXEC dbo.sp_AddColSafe 'qms_master_checklist', 'CREATED_DATE', 'DATETIME DEFAULT GETDATE()';
EXEC dbo.sp_AddColSafe 'qms_master_checklist', 'CREATED_USER', 'NVARCHAR(100)';
EXEC dbo.sp_AddColSafe 'qms_master_checklist', 'UPDATED_DATE', 'DATETIME';
EXEC dbo.sp_AddColSafe 'qms_master_checklist', 'UPDATED_USER', 'NVARCHAR(100)';

-- qms_checklist_department: add all four if missing
EXEC dbo.sp_AddColSafe 'qms_checklist_department', 'CREATED_DATE', 'DATETIME DEFAULT GETDATE()';
EXEC dbo.sp_AddColSafe 'qms_checklist_department', 'CREATED_USER', 'NVARCHAR(100)';
EXEC dbo.sp_AddColSafe 'qms_checklist_department', 'UPDATED_DATE', 'DATETIME';
EXEC dbo.sp_AddColSafe 'qms_checklist_department', 'UPDATED_USER', 'NVARCHAR(100)';

-- qms_meeting_schedule_department: add all four if missing
EXEC dbo.sp_AddColSafe 'qms_meeting_schedule_department', 'CREATED_DATE', 'DATETIME DEFAULT GETDATE()';
EXEC dbo.sp_AddColSafe 'qms_meeting_schedule_department', 'CREATED_USER', 'NVARCHAR(100)';
EXEC dbo.sp_AddColSafe 'qms_meeting_schedule_department', 'UPDATED_DATE', 'DATETIME';
EXEC dbo.sp_AddColSafe 'qms_meeting_schedule_department', 'UPDATED_USER', 'NVARCHAR(100)';

-- qms_meeting_schedule_participant: add all four if missing
EXEC dbo.sp_AddColSafe 'qms_meeting_schedule_participant', 'CREATED_DATE', 'DATETIME DEFAULT GETDATE()';
EXEC dbo.sp_AddColSafe 'qms_meeting_schedule_participant', 'CREATED_USER', 'NVARCHAR(100)';
EXEC dbo.sp_AddColSafe 'qms_meeting_schedule_participant', 'UPDATED_DATE', 'DATETIME';
EXEC dbo.sp_AddColSafe 'qms_meeting_schedule_participant', 'UPDATED_USER', 'NVARCHAR(100)';

-- QMS_CHECKLIST_ASSIGNMENT_FILES: add all four if missing
EXEC dbo.sp_AddColSafe 'QMS_CHECKLIST_ASSIGNMENT_FILES', 'CREATED_DATE', 'DATETIME DEFAULT GETDATE()';
EXEC dbo.sp_AddColSafe 'QMS_CHECKLIST_ASSIGNMENT_FILES', 'CREATED_USER', 'NVARCHAR(100)';
EXEC dbo.sp_AddColSafe 'QMS_CHECKLIST_ASSIGNMENT_FILES', 'UPDATED_DATE', 'DATETIME';
EXEC dbo.sp_AddColSafe 'QMS_CHECKLIST_ASSIGNMENT_FILES', 'UPDATED_USER', 'NVARCHAR(100)';
GO

-- ===========================================================
-- STEP 4: Drop helpers
-- ===========================================================
IF OBJECT_ID('dbo.sp_RenameColSafe', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_RenameColSafe;
IF OBJECT_ID('dbo.sp_AddColSafe',    'P') IS NOT NULL DROP PROCEDURE dbo.sp_AddColSafe;
GO

PRINT 'V40.0 patch completed: all missing audit columns added and ad_backend_error_log created.';
GO
