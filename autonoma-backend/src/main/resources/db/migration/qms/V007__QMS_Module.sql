-- V007__QMS_Module.sql
-- Phase 7: QMS & Audit Module Schema Standardization
-- Renames and normalizes legacy QMS and Audit tables and their column casing to UPPERCASE NVARCHAR

-- ==========================================================
-- 0. Dynamic Foreign Key Drop to prevent dependency locks
-- ==========================================================
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) + 
               ' DROP CONSTRAINT ' + QUOTENAME(name) + ';' + CHAR(13) + CHAR(10)
FROM sys.foreign_keys
WHERE OBJECT_NAME(referenced_object_id) LIKE 'qms_%'
   OR OBJECT_NAME(referenced_object_id) LIKE 'QMS_%'
   OR referenced_object_id IN (
       OBJECT_ID('QMS_CHECKLIST_MASTER'),
       OBJECT_ID('QMS_MEETING_MASTER'),
       OBJECT_ID('QMS_MOM_MASTER')
   );
IF @sql <> N''
BEGIN
    EXEC sp_executesql @sql;
END
GO

-- ==========================================================
-- 1. Helper Stored Procedure for Case-Sensitive Column Renames
-- ==========================================================
IF OBJECT_ID('dbo.sp_RenameColumnCS', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_RenameColumnCS;
GO

CREATE PROCEDURE dbo.sp_RenameColumnCS
    @tableName NVARCHAR(256),
    @oldCol NVARCHAR(256),
    @newCol NVARCHAR(256)
AS
BEGIN
    IF OBJECT_ID(@tableName, 'U') IS NOT NULL
    BEGIN
        IF COL_LENGTH(@tableName, @oldCol) IS NOT NULL
        BEGIN
            IF (SELECT name FROM sys.columns WHERE object_id = OBJECT_ID(@tableName) AND name = @oldCol) COLLATE Latin1_General_CS_AS <> @newCol
            BEGIN
                DECLARE @oldFull NVARCHAR(600) = @tableName + '.' + @oldCol;
                DECLARE @tempCol NVARCHAR(300) = @oldCol + '_TEMP';
                EXEC sp_rename @oldFull, @tempCol, 'COLUMN';
                DECLARE @tempFull NVARCHAR(600) = @tableName + '.' + @tempCol;
                EXEC sp_rename @tempFull, @newCol, 'COLUMN';
            END
        END
    END
END;
GO

-- ==========================================================
-- 2. Table Renames
-- ==========================================================
IF OBJECT_ID('QMS_CHECKLIST_MASTER', 'U') IS NOT NULL AND OBJECT_ID('QMS_CHECKLIST', 'U') IS NULL
BEGIN
    EXEC sp_rename 'QMS_CHECKLIST_MASTER', 'QMS_CHECKLIST';
END
GO

IF OBJECT_ID('QMS_MEETING_MASTER', 'U') IS NOT NULL AND OBJECT_ID('QMS_MEETING', 'U') IS NULL
BEGIN
    EXEC sp_rename 'QMS_MEETING_MASTER', 'QMS_MEETING';
END
GO

IF OBJECT_ID('QMS_MOM_MASTER', 'U') IS NOT NULL AND OBJECT_ID('QMS_MOM', 'U') IS NULL
BEGIN
    EXEC sp_rename 'QMS_MOM_MASTER', 'QMS_MOM';
END
GO

-- ==========================================================
-- 3. QMS_CHECKLIST Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_CHECKLIST', 'U') IS NOT NULL
BEGIN
    -- Handle duplicate created_at / CREATED_DATE
    IF COL_LENGTH('QMS_CHECKLIST', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_CHECKLIST', 'created_date') IS NOT NULL
        ALTER TABLE QMS_CHECKLIST DROP COLUMN created_at;
    IF COL_LENGTH('QMS_CHECKLIST', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_CHECKLIST', 'updated_date') IS NOT NULL
        ALTER TABLE QMS_CHECKLIST DROP COLUMN updated_at;

    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'seq_no', 'SEQ_NO';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'checking_point', 'CHECKING_POINT';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'description', 'DESCRIPTION';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'category', 'CATEGORY';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'frequency', 'FREQUENCY';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'week_days', 'WEEK_DAYS';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'repeat_every_value', 'REPEAT_EVERY_VALUE';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'repeat_every_unit', 'REPEAT_EVERY_UNIT';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'effective_from', 'EFFECTIVE_FROM';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'expiry_date', 'EXPIRY_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'reminder_days', 'REMINDER_DAYS';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'reminder_date', 'REMINDER_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'stock_link', 'STOCK_LINK';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'photo_required', 'PHOTO_REQUIRED';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'verification_required', 'VERIFICATION_REQUIRED';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'last_completed_date', 'LAST_COMPLETED_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'next_due_date', 'NEXT_DUE_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'dual_check', 'DUAL_CHECK';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'carry_forward', 'CARRY_FORWARD';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'carry_forward_status', 'CARRY_FORWARD_STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'amendment_reason', 'AMENDMENT_REASON';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'level_ids', 'LEVEL_IDS';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'uploaded_files', 'UPLOADED_FILES';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'scanned_files', 'SCANNED_FILES';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'task_status', 'TASK_STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'verify_status', 'VERIFY_STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'verified_by', 'VERIFIED_BY';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'verified_date', 'VERIFIED_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'rej_reason', 'REJ_REASON';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'assign_to', 'ASSIGN_TO';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'assign_date', 'ASSIGN_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'item_code', 'ITEM_CODE';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'qty', 'QTY';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_CHECKLIST', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_CHECKLIST', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_CHECKLIST.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_CHECKLIST', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_CHECKLIST', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_CHECKLIST.updated_at', 'UPDATED_DATE', 'COLUMN';

    -- Alter column datatypes to standard uppercase sizes
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN SEQ_NO NVARCHAR(50);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN CHECKING_POINT NVARCHAR(255);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN DESCRIPTION NVARCHAR(MAX);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN CATEGORY NVARCHAR(50);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN FREQUENCY NVARCHAR(50);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN WEEK_DAYS NVARCHAR(100);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN REPEAT_EVERY_UNIT NVARCHAR(50);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN STOCK_LINK NVARCHAR(255);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN PHOTO_REQUIRED NVARCHAR(20);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN VERIFICATION_REQUIRED NVARCHAR(20);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN DUAL_CHECK NVARCHAR(20);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN CARRY_FORWARD NVARCHAR(20);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN CARRY_FORWARD_STATUS NVARCHAR(20);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN AMENDMENT_REASON NVARCHAR(MAX);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN LEVEL_IDS NVARCHAR(255);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN UPLOADED_FILES NVARCHAR(1000);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN SCANNED_FILES NVARCHAR(1000);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN VERIFIED_BY NVARCHAR(100);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN REJ_REASON NVARCHAR(255);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN ASSIGN_TO NVARCHAR(100);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN ITEM_CODE NVARCHAR(50);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN QTY NVARCHAR(50);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_CHECKLIST ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_CHECKLIST', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_CHECKLIST ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- PK
IF OBJECT_ID('QMS_CHECKLIST', 'U') IS NOT NULL
BEGIN
    DECLARE @chk_pk NVARCHAR(255);
    SELECT TOP 1 @chk_pk = name FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('QMS_CHECKLIST') AND type = 'PK';
    IF @chk_pk IS NOT NULL AND @chk_pk <> 'PK_QMS_CHECKLIST'
    BEGIN
        DECLARE @drop_chk_pk NVARCHAR(MAX) = 'ALTER TABLE QMS_CHECKLIST DROP CONSTRAINT ' + @chk_pk;
        EXEC(@drop_chk_pk);
    END
    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('QMS_CHECKLIST') AND name = 'PK_QMS_CHECKLIST')
    BEGIN
        ALTER TABLE QMS_CHECKLIST ADD CONSTRAINT PK_QMS_CHECKLIST PRIMARY KEY (id);
    END
END
GO

-- ==========================================================
-- 4. QMS_CHECKLIST_ASSIGNMENT Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_CHECKLIST_ASSIGNMENT', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_ASSIGNMENT', 'checklist_id', 'CHECKLIST_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_ASSIGNMENT', 'assigned_to', 'ASSIGNED_TO';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_ASSIGNMENT', 'assigned_by', 'ASSIGNED_BY';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_ASSIGNMENT', 'assigned_date', 'ASSIGNED_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_ASSIGNMENT', 'status_id', 'STATUS_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_ASSIGNMENT', 'remarks', 'REMARKS';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_ASSIGNMENT', 'checklist_date', 'CHECKLIST_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_ASSIGNMENT', 'carry_forward', 'CARRY_FORWARD';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_ASSIGNMENT', 'carry_forward_status', 'CARRY_FORWARD_STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_ASSIGNMENT', 'carry_forward_count', 'CARRY_FORWARD_COUNT';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_ASSIGNMENT', 'assign_type', 'ASSIGN_TYPE';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_ASSIGNMENT', 'verified_by', 'VERIFIED_BY';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_ASSIGNMENT', 'verified_date', 'VERIFIED_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_ASSIGNMENT', 'comments', 'COMMENTS';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_ASSIGNMENT', 'file_paths', 'FILE_PATHS';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_ASSIGNMENT', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_ASSIGNMENT', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_CHECKLIST_ASSIGNMENT', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_CHECKLIST_ASSIGNMENT', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_CHECKLIST_ASSIGNMENT.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_CHECKLIST_ASSIGNMENT', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_CHECKLIST_ASSIGNMENT', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_CHECKLIST_ASSIGNMENT.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE QMS_CHECKLIST_ASSIGNMENT ALTER COLUMN ASSIGNED_TO NVARCHAR(100);
    ALTER TABLE QMS_CHECKLIST_ASSIGNMENT ALTER COLUMN ASSIGNED_BY NVARCHAR(100);
    ALTER TABLE QMS_CHECKLIST_ASSIGNMENT ALTER COLUMN REMARKS NVARCHAR(MAX);
    ALTER TABLE QMS_CHECKLIST_ASSIGNMENT ALTER COLUMN CARRY_FORWARD NVARCHAR(20);
    ALTER TABLE QMS_CHECKLIST_ASSIGNMENT ALTER COLUMN CARRY_FORWARD_STATUS NVARCHAR(20);
    ALTER TABLE QMS_CHECKLIST_ASSIGNMENT ALTER COLUMN ASSIGN_TYPE NVARCHAR(50);
    ALTER TABLE QMS_CHECKLIST_ASSIGNMENT ALTER COLUMN VERIFIED_BY NVARCHAR(100);
    ALTER TABLE QMS_CHECKLIST_ASSIGNMENT ALTER COLUMN COMMENTS NVARCHAR(MAX);
    ALTER TABLE QMS_CHECKLIST_ASSIGNMENT ALTER COLUMN FILE_PATHS NVARCHAR(1000);
    ALTER TABLE QMS_CHECKLIST_ASSIGNMENT ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_CHECKLIST_ASSIGNMENT ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_CHECKLIST_ASSIGNMENT', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_CHECKLIST_ASSIGNMENT ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 5. QMS_CHECKLIST_CLOSED Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_CHECKLIST_CLOSED', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_CLOSED', 'checklist_id', 'CHECKLIST_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_CLOSED', 'assigned_to', 'ASSIGNED_TO';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_CLOSED', 'assigned_by', 'ASSIGNED_BY';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_CLOSED', 'assigned_date', 'ASSIGNED_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_CLOSED', 'status_id', 'STATUS_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_CLOSED', 'remarks', 'REMARKS';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_CLOSED', 'checklist_date', 'CHECKLIST_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_CLOSED', 'carry_forward', 'CARRY_FORWARD';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_CLOSED', 'carry_forward_status', 'CARRY_FORWARD_STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_CLOSED', 'carry_forward_count', 'CARRY_FORWARD_COUNT';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_CLOSED', 'assign_type', 'ASSIGN_TYPE';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_CLOSED', 'verified_by', 'VERIFIED_BY';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_CLOSED', 'verified_date', 'VERIFIED_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_CLOSED', 'comments', 'COMMENTS';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_CLOSED', 'file_paths', 'FILE_PATHS';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_CLOSED', 'frequency', 'FREQUENCY';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_CLOSED', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_CHECKLIST_CLOSED', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_CHECKLIST_CLOSED', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_CHECKLIST_CLOSED', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_CHECKLIST_CLOSED.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_CHECKLIST_CLOSED', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_CHECKLIST_CLOSED', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_CHECKLIST_CLOSED.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE QMS_CHECKLIST_CLOSED ALTER COLUMN ASSIGNED_TO NVARCHAR(100);
    ALTER TABLE QMS_CHECKLIST_CLOSED ALTER COLUMN ASSIGNED_BY NVARCHAR(100);
    ALTER TABLE QMS_CHECKLIST_CLOSED ALTER COLUMN REMARKS NVARCHAR(MAX);
    ALTER TABLE QMS_CHECKLIST_CLOSED ALTER COLUMN CARRY_FORWARD NVARCHAR(20);
    ALTER TABLE QMS_CHECKLIST_CLOSED ALTER COLUMN CARRY_FORWARD_STATUS NVARCHAR(20);
    ALTER TABLE QMS_CHECKLIST_CLOSED ALTER COLUMN ASSIGN_TYPE NVARCHAR(50);
    ALTER TABLE QMS_CHECKLIST_CLOSED ALTER COLUMN VERIFIED_BY NVARCHAR(100);
    ALTER TABLE QMS_CHECKLIST_CLOSED ALTER COLUMN COMMENTS NVARCHAR(MAX);
    ALTER TABLE QMS_CHECKLIST_CLOSED ALTER COLUMN FILE_PATHS NVARCHAR(1000);
    ALTER TABLE QMS_CHECKLIST_CLOSED ALTER COLUMN FREQUENCY NVARCHAR(50) NOT NULL;
    ALTER TABLE QMS_CHECKLIST_CLOSED ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_CHECKLIST_CLOSED ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_CHECKLIST_CLOSED', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_CHECKLIST_CLOSED ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 6. QMS_MEETING Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_MEETING', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING', 'meeting_name', 'MEETING_NAME';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING', 'meeting_description', 'MEETING_DESCRIPTION';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING', 'meeting_prefix', 'MEETING_PREFIX';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING', 'meeting_agenda', 'MEETING_AGENDA';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING', 'employee_name', 'EMPLOYEE_NAME';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING', 'attachment_name', 'ATTACHMENT_NAME';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING', 'attachment_url', 'ATTACHMENT_URL';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_MEETING', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_MEETING', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_MEETING.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_MEETING', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_MEETING', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_MEETING.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE QMS_MEETING ALTER COLUMN MEETING_NAME NVARCHAR(255) NOT NULL;
    ALTER TABLE QMS_MEETING ALTER COLUMN MEETING_DESCRIPTION NVARCHAR(MAX);
    ALTER TABLE QMS_MEETING ALTER COLUMN MEETING_PREFIX NVARCHAR(50) NOT NULL;
    ALTER TABLE QMS_MEETING ALTER COLUMN MEETING_AGENDA NVARCHAR(MAX);
    ALTER TABLE QMS_MEETING ALTER COLUMN EMPLOYEE_NAME NVARCHAR(100);
    ALTER TABLE QMS_MEETING ALTER COLUMN STATUS NVARCHAR(50);
    ALTER TABLE QMS_MEETING ALTER COLUMN ATTACHMENT_NAME NVARCHAR(255);
    ALTER TABLE QMS_MEETING ALTER COLUMN ATTACHMENT_URL NVARCHAR(1000);
    ALTER TABLE QMS_MEETING ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_MEETING ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_MEETING', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_MEETING ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- PK
IF OBJECT_ID('QMS_MEETING', 'U') IS NOT NULL
BEGIN
    DECLARE @meet_pk NVARCHAR(255);
    SELECT TOP 1 @meet_pk = name FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('QMS_MEETING') AND type = 'PK';
    IF @meet_pk IS NOT NULL AND @meet_pk <> 'PK_QMS_MEETING'
    BEGIN
        DECLARE @drop_meet_pk NVARCHAR(MAX) = 'ALTER TABLE QMS_MEETING DROP CONSTRAINT ' + @meet_pk;
        EXEC(@drop_meet_pk);
    END
    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('QMS_MEETING') AND name = 'PK_QMS_MEETING')
    BEGIN
        ALTER TABLE QMS_MEETING ADD CONSTRAINT PK_QMS_MEETING PRIMARY KEY (id);
    END
END
GO

-- ==========================================================
-- 7. QMS_MEETING_SCHEDULE Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_MEETING_SCHEDULE', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'schedule_no', 'SCHEDULE_NO';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'rev_source_schedule_no', 'REV_SOURCE_SCHEDULE_NO';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'rev_no', 'REV_NO';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'meeting_type_id', 'MEETING_TYPE_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'meeting_name', 'MEETING_NAME';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'description', 'DESCRIPTION';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'agenda', 'AGENDA';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'subject', 'SUBJECT';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'customer_code', 'CUSTOMER_CODE';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'supplier_code', 'SUPPLIER_CODE';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'meeting_date', 'MEETING_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'start_time', 'START_TIME';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'end_time', 'END_TIME';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'interval_time', 'INTERVAL_TIME';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'frequency', 'FREQUENCY';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'weekdays', 'WEEKDAYS';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'chaired_by_id', 'CHAIRED_BY_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'host_by_id', 'HOST_BY_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'cancel_reason', 'CANCEL_REASON';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'reschedule_reason', 'RESCHEDULE_REASON';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'comments', 'COMMENTS';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_MEETING_SCHEDULE', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_MEETING_SCHEDULE', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_MEETING_SCHEDULE.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_MEETING_SCHEDULE', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_MEETING_SCHEDULE', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_MEETING_SCHEDULE.updated_at', 'UPDATED_DATE', 'COLUMN';

    -- Drop unique constraint/index on SCHEDULE_NO dynamically to allow type alteration
    DECLARE @drop_uq NVARCHAR(MAX) = N'';
    SELECT @drop_uq += N'ALTER TABLE [QMS_MEETING_SCHEDULE] DROP CONSTRAINT ' + QUOTENAME(dc.name) + ';' + CHAR(13) + CHAR(10)
    FROM sys.key_constraints dc
    INNER JOIN sys.index_columns ic ON dc.parent_object_id = ic.object_id AND dc.unique_index_id = ic.index_id
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE dc.parent_object_id = OBJECT_ID('QMS_MEETING_SCHEDULE')
      AND c.name = 'SCHEDULE_NO';
    IF @drop_uq <> N'' EXEC sp_executesql @drop_uq;

    DECLARE @drop_idx NVARCHAR(MAX) = N'';
    SELECT @drop_idx += N'DROP INDEX ' + QUOTENAME(i.name) + ' ON [QMS_MEETING_SCHEDULE];' + CHAR(13) + CHAR(10)
    FROM sys.indexes i
    INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE i.object_id = OBJECT_ID('QMS_MEETING_SCHEDULE')
      AND c.name = 'SCHEDULE_NO'
      AND i.is_primary_key = 0
      AND i.is_unique_constraint = 0;
    IF @drop_idx <> N'' EXEC sp_executesql @drop_idx;

    ALTER TABLE QMS_MEETING_SCHEDULE ALTER COLUMN SCHEDULE_NO NVARCHAR(50) NOT NULL;
    ALTER TABLE QMS_MEETING_SCHEDULE ALTER COLUMN REV_SOURCE_SCHEDULE_NO NVARCHAR(50);
    ALTER TABLE QMS_MEETING_SCHEDULE ALTER COLUMN MEETING_NAME NVARCHAR(255);
    ALTER TABLE QMS_MEETING_SCHEDULE ALTER COLUMN DESCRIPTION NVARCHAR(MAX);
    ALTER TABLE QMS_MEETING_SCHEDULE ALTER COLUMN AGENDA NVARCHAR(MAX);
    ALTER TABLE QMS_MEETING_SCHEDULE ALTER COLUMN SUBJECT NVARCHAR(MAX);
    ALTER TABLE QMS_MEETING_SCHEDULE ALTER COLUMN CUSTOMER_CODE NVARCHAR(50);
    ALTER TABLE QMS_MEETING_SCHEDULE ALTER COLUMN SUPPLIER_CODE NVARCHAR(50);
    ALTER TABLE QMS_MEETING_SCHEDULE ALTER COLUMN FREQUENCY NVARCHAR(50);
    ALTER TABLE QMS_MEETING_SCHEDULE ALTER COLUMN WEEKDAYS NVARCHAR(100);
    ALTER TABLE QMS_MEETING_SCHEDULE ALTER COLUMN CANCEL_REASON NVARCHAR(255);
    ALTER TABLE QMS_MEETING_SCHEDULE ALTER COLUMN RESCHEDULE_REASON NVARCHAR(255);
    ALTER TABLE QMS_MEETING_SCHEDULE ALTER COLUMN COMMENTS NVARCHAR(MAX);
    ALTER TABLE QMS_MEETING_SCHEDULE ALTER COLUMN STATUS NVARCHAR(50);
    ALTER TABLE QMS_MEETING_SCHEDULE ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_MEETING_SCHEDULE ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_MEETING_SCHEDULE', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_MEETING_SCHEDULE ADD IS_ACTIVE BIT DEFAULT 1;

    -- Re-create unique constraint
    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('QMS_MEETING_SCHEDULE') AND name = 'UQ_QMS_MEETING_SCHEDULE_NO')
    BEGIN
        ALTER TABLE QMS_MEETING_SCHEDULE ADD CONSTRAINT UQ_QMS_MEETING_SCHEDULE_NO UNIQUE (SCHEDULE_NO);
    END
END
GO

-- ==========================================================
-- 8. QMS_MEETING_SCHEDULE_DEPARTMENT Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_MEETING_SCHEDULE_DEPARTMENT', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE_DEPARTMENT', 'schedule_id', 'SCHEDULE_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE_DEPARTMENT', 'department_id', 'DEPARTMENT_ID';
END
GO

-- ==========================================================
-- 9. QMS_MEETING_SCHEDULE_PARTICIPANT Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_MEETING_SCHEDULE_PARTICIPANT', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE_PARTICIPANT', 'schedule_id', 'SCHEDULE_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_SCHEDULE_PARTICIPANT', 'employee_id', 'EMPLOYEE_ID';
END
GO

-- ==========================================================
-- 10. QMS_MEETING_USER_ATTENDANCE Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_MEETING_USER_ATTENDANCE', 'U') IS NOT NULL
BEGIN
    -- Drop unique constraint on schedule_id, employee_id dynamically
    DECLARE @drop_att_uq NVARCHAR(MAX) = N'';
    SELECT @drop_att_uq += N'ALTER TABLE QMS_MEETING_USER_ATTENDANCE DROP CONSTRAINT ' + QUOTENAME(name) + ';' + CHAR(13) + CHAR(10)
    FROM sys.key_constraints
    WHERE parent_object_id = OBJECT_ID('QMS_MEETING_USER_ATTENDANCE') AND type = 'UQ';
    IF @drop_att_uq <> N'' EXEC sp_executesql @drop_att_uq;

    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_USER_ATTENDANCE', 'schedule_id', 'SCHEDULE_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_USER_ATTENDANCE', 'employee_id', 'EMPLOYEE_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_USER_ATTENDANCE', 'in_time', 'IN_TIME';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_USER_ATTENDANCE', 'out_time', 'OUT_TIME';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_USER_ATTENDANCE', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_USER_ATTENDANCE', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_MEETING_USER_ATTENDANCE', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_MEETING_USER_ATTENDANCE', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_MEETING_USER_ATTENDANCE', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_MEETING_USER_ATTENDANCE.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_MEETING_USER_ATTENDANCE', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_MEETING_USER_ATTENDANCE', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_MEETING_USER_ATTENDANCE.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE QMS_MEETING_USER_ATTENDANCE ALTER COLUMN SCHEDULE_ID BIGINT NOT NULL;
    ALTER TABLE QMS_MEETING_USER_ATTENDANCE ALTER COLUMN EMPLOYEE_ID BIGINT NOT NULL;
    ALTER TABLE QMS_MEETING_USER_ATTENDANCE ALTER COLUMN STATUS NVARCHAR(50);
    ALTER TABLE QMS_MEETING_USER_ATTENDANCE ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_MEETING_USER_ATTENDANCE ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_MEETING_USER_ATTENDANCE', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_MEETING_USER_ATTENDANCE ADD IS_ACTIVE BIT DEFAULT 1;

    -- Re-create unique constraint
    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('QMS_MEETING_USER_ATTENDANCE') AND name = 'UQ_QMS_MEETING_USER_ATTENDANCE')
    BEGIN
        ALTER TABLE QMS_MEETING_USER_ATTENDANCE ADD CONSTRAINT UQ_QMS_MEETING_USER_ATTENDANCE UNIQUE (SCHEDULE_ID, EMPLOYEE_ID);
    END
END
GO

-- ==========================================================
-- 11. QMS_MOM Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_MOM', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM', 'mom_no', 'MOM_NO';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM', 'mom_date', 'MOM_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM', 'schedule_id', 'SCHEDULE_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM', 'agenda', 'AGENDA';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM', 'chaired_by_id', 'CHAIRED_BY_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM', 'start_time', 'START_TIME';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM', 'end_time', 'END_TIME';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_MOM', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_MOM', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_MOM.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_MOM', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_MOM', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_MOM.updated_at', 'UPDATED_DATE', 'COLUMN';

    -- Drop unique constraint/index on MOM_NO dynamically to allow type alteration
    DECLARE @drop_uq_mom NVARCHAR(MAX) = N'';
    SELECT @drop_uq_mom += N'ALTER TABLE [QMS_MOM] DROP CONSTRAINT ' + QUOTENAME(dc.name) + ';' + CHAR(13) + CHAR(10)
    FROM sys.key_constraints dc
    INNER JOIN sys.index_columns ic ON dc.parent_object_id = ic.object_id AND dc.unique_index_id = ic.index_id
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE dc.parent_object_id = OBJECT_ID('QMS_MOM')
      AND c.name = 'MOM_NO';
    IF @drop_uq_mom <> N'' EXEC sp_executesql @drop_uq_mom;

    DECLARE @drop_idx_mom NVARCHAR(MAX) = N'';
    SELECT @drop_idx_mom += N'DROP INDEX ' + QUOTENAME(i.name) + ' ON [QMS_MOM];' + CHAR(13) + CHAR(10)
    FROM sys.indexes i
    INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE i.object_id = OBJECT_ID('QMS_MOM')
      AND c.name = 'MOM_NO'
      AND i.is_primary_key = 0
      AND i.is_unique_constraint = 0;
    IF @drop_idx_mom <> N'' EXEC sp_executesql @drop_idx_mom;

    ALTER TABLE QMS_MOM ALTER COLUMN MOM_NO NVARCHAR(50) NOT NULL;
    ALTER TABLE QMS_MOM ALTER COLUMN AGENDA NVARCHAR(MAX);
    ALTER TABLE QMS_MOM ALTER COLUMN STATUS NVARCHAR(50);
    ALTER TABLE QMS_MOM ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_MOM ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_MOM', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_MOM ADD IS_ACTIVE BIT DEFAULT 1;

    -- Re-create unique constraint
    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('QMS_MOM') AND name = 'UQ_QMS_MOM_NO')
    BEGIN
        ALTER TABLE QMS_MOM ADD CONSTRAINT UQ_QMS_MOM_NO UNIQUE (MOM_NO);
    END
END
GO

-- PK
IF OBJECT_ID('QMS_MOM', 'U') IS NOT NULL
BEGIN
    DECLARE @mom_pk NVARCHAR(255);
    SELECT TOP 1 @mom_pk = name FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('QMS_MOM') AND type = 'PK';
    IF @mom_pk IS NOT NULL AND @mom_pk <> 'PK_QMS_MOM'
    BEGIN
        DECLARE @drop_mom_pk NVARCHAR(MAX) = 'ALTER TABLE QMS_MOM DROP CONSTRAINT ' + @mom_pk;
        EXEC(@drop_mom_pk);
    END
    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('QMS_MOM') AND name = 'PK_QMS_MOM')
    BEGIN
        ALTER TABLE QMS_MOM ADD CONSTRAINT PK_QMS_MOM PRIMARY KEY (id);
    END
END
GO

-- ==========================================================
-- 12. QMS_MOM_ATTENDANCE Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_MOM_ATTENDANCE', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_ATTENDANCE', 'mom_id', 'MOM_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_ATTENDANCE', 'employee_id', 'EMPLOYEE_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_ATTENDANCE', 'in_time', 'IN_TIME';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_ATTENDANCE', 'out_time', 'OUT_TIME';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_ATTENDANCE', 'attendance_status', 'ATTENDANCE_STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_ATTENDANCE', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_ATTENDANCE', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_MOM_ATTENDANCE', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_MOM_ATTENDANCE', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_MOM_ATTENDANCE.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_MOM_ATTENDANCE', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_MOM_ATTENDANCE', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_MOM_ATTENDANCE.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE QMS_MOM_ATTENDANCE ALTER COLUMN ATTENDANCE_STATUS NVARCHAR(50);
    ALTER TABLE QMS_MOM_ATTENDANCE ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_MOM_ATTENDANCE ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_MOM_ATTENDANCE', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_MOM_ATTENDANCE ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 13. QMS_MOM_DETAIL Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_MOM_DETAIL', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_DETAIL', 'mom_id', 'MOM_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_DETAIL', 'discussed_point', 'DISCUSSED_POINT';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_DETAIL', 'point_type', 'POINT_TYPE';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_DETAIL', 'material_list', 'MATERIAL_LIST';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_DETAIL', 'process_type', 'PROCESS_TYPE';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_DETAIL', 'assigned_by_id', 'ASSIGNED_BY_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_DETAIL', 'assigned_to_id', 'ASSIGNED_TO_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_DETAIL', 'target_date', 'TARGET_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_DETAIL', 'review_date', 'REVIEW_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_DETAIL', 'attachment_required', 'ATTACHMENT_REQUIRED';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_DETAIL', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_DETAIL', 'action_taken', 'ACTION_TAKEN';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_DETAIL', 'action_observation', 'ACTION_OBSERVATION';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_DETAIL', 'cancel_remarks', 'CANCEL_REMARKS';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_DETAIL', 'rev_no', 'REV_NO';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_DETAIL', 'amendment_comments', 'AMENDMENT_COMMENTS';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_DETAIL', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_MOM_DETAIL', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_MOM_DETAIL', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_MOM_DETAIL', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_MOM_DETAIL.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_MOM_DETAIL', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_MOM_DETAIL', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_MOM_DETAIL.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE QMS_MOM_DETAIL ALTER COLUMN DISCUSSED_POINT NVARCHAR(MAX) NOT NULL;
    ALTER TABLE QMS_MOM_DETAIL ALTER COLUMN POINT_TYPE NVARCHAR(50);
    ALTER TABLE QMS_MOM_DETAIL ALTER COLUMN MATERIAL_LIST NVARCHAR(MAX);
    ALTER TABLE QMS_MOM_DETAIL ALTER COLUMN PROCESS_TYPE NVARCHAR(50);
    ALTER TABLE QMS_MOM_DETAIL ALTER COLUMN ATTACHMENT_REQUIRED NVARCHAR(20);
    ALTER TABLE QMS_MOM_DETAIL ALTER COLUMN STATUS NVARCHAR(50);
    ALTER TABLE QMS_MOM_DETAIL ALTER COLUMN ACTION_TAKEN NVARCHAR(MAX);
    ALTER TABLE QMS_MOM_DETAIL ALTER COLUMN ACTION_OBSERVATION NVARCHAR(MAX);
    ALTER TABLE QMS_MOM_DETAIL ALTER COLUMN CANCEL_REMARKS NVARCHAR(MAX);
    ALTER TABLE QMS_MOM_DETAIL ALTER COLUMN AMENDMENT_COMMENTS NVARCHAR(MAX);
    ALTER TABLE QMS_MOM_DETAIL ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_MOM_DETAIL ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_MOM_DETAIL', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_MOM_DETAIL ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 14. QMS_MODEL_NAME Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_MODEL_NAME', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_MODEL_NAME', 'model_name', 'MODEL_NAME';
    EXEC dbo.sp_RenameColumnCS 'QMS_MODEL_NAME', 'description', 'DESCRIPTION';
    EXEC dbo.sp_RenameColumnCS 'QMS_MODEL_NAME', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_MODEL_NAME', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_MODEL_NAME', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_MODEL_NAME', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_MODEL_NAME', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_MODEL_NAME.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_MODEL_NAME', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_MODEL_NAME', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_MODEL_NAME.updated_at', 'UPDATED_DATE', 'COLUMN';

    -- Drop unique constraint/index on MODEL_NAME dynamically to allow type alteration
    DECLARE @drop_uq_mod NVARCHAR(MAX) = N'';
    SELECT @drop_uq_mod += N'ALTER TABLE [QMS_MODEL_NAME] DROP CONSTRAINT ' + QUOTENAME(dc.name) + ';' + CHAR(13) + CHAR(10)
    FROM sys.key_constraints dc
    INNER JOIN sys.index_columns ic ON dc.parent_object_id = ic.object_id AND dc.unique_index_id = ic.index_id
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE dc.parent_object_id = OBJECT_ID('QMS_MODEL_NAME')
      AND c.name = 'MODEL_NAME';
    IF @drop_uq_mod <> N'' EXEC sp_executesql @drop_uq_mod;

    DECLARE @drop_idx_mod NVARCHAR(MAX) = N'';
    SELECT @drop_idx_mod += N'DROP INDEX ' + QUOTENAME(i.name) + ' ON [QMS_MODEL_NAME];' + CHAR(13) + CHAR(10)
    FROM sys.indexes i
    INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE i.object_id = OBJECT_ID('QMS_MODEL_NAME')
      AND c.name = 'MODEL_NAME'
      AND i.is_primary_key = 0
      AND i.is_unique_constraint = 0;
    IF @drop_idx_mod <> N'' EXEC sp_executesql @drop_idx_mod;

    ALTER TABLE QMS_MODEL_NAME ALTER COLUMN MODEL_NAME NVARCHAR(100) NOT NULL;
    ALTER TABLE QMS_MODEL_NAME ALTER COLUMN DESCRIPTION NVARCHAR(255);
    ALTER TABLE QMS_MODEL_NAME ALTER COLUMN STATUS NVARCHAR(20);
    ALTER TABLE QMS_MODEL_NAME ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_MODEL_NAME ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_MODEL_NAME', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_MODEL_NAME ADD IS_ACTIVE BIT DEFAULT 1;

    -- Re-create unique constraint
    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('QMS_MODEL_NAME') AND name = 'UQ_QMS_MODEL_NAME')
    BEGIN
        ALTER TABLE QMS_MODEL_NAME ADD CONSTRAINT UQ_QMS_MODEL_NAME UNIQUE (MODEL_NAME);
    END
END
GO

-- ==========================================================
-- 15. QMS_UOM Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_UOM', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_UOM', 'uom_code', 'UOM_CODE';
    EXEC dbo.sp_RenameColumnCS 'QMS_UOM', 'uom_description', 'UOM_DESCRIPTION';
    EXEC dbo.sp_RenameColumnCS 'QMS_UOM', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_UOM', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_UOM', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_UOM', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_UOM', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_UOM.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_UOM', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_UOM', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_UOM.updated_at', 'UPDATED_DATE', 'COLUMN';

    -- Drop unique constraint/index on UOM_CODE dynamically to allow type alteration
    DECLARE @drop_uq_uom NVARCHAR(MAX) = N'';
    SELECT @drop_uq_uom += N'ALTER TABLE [QMS_UOM] DROP CONSTRAINT ' + QUOTENAME(dc.name) + ';' + CHAR(13) + CHAR(10)
    FROM sys.key_constraints dc
    INNER JOIN sys.index_columns ic ON dc.parent_object_id = ic.object_id AND dc.unique_index_id = ic.index_id
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE dc.parent_object_id = OBJECT_ID('QMS_UOM')
      AND c.name = 'UOM_CODE';
    IF @drop_uq_uom <> N'' EXEC sp_executesql @drop_uq_uom;

    DECLARE @drop_idx_uom NVARCHAR(MAX) = N'';
    SELECT @drop_idx_uom += N'DROP INDEX ' + QUOTENAME(i.name) + ' ON [QMS_UOM];' + CHAR(13) + CHAR(10)
    FROM sys.indexes i
    INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE i.object_id = OBJECT_ID('QMS_UOM')
      AND c.name = 'UOM_CODE'
      AND i.is_primary_key = 0
      AND i.is_unique_constraint = 0;
    IF @drop_idx_uom <> N'' EXEC sp_executesql @drop_idx_uom;

    ALTER TABLE QMS_UOM ALTER COLUMN UOM_CODE NVARCHAR(50) NOT NULL;
    ALTER TABLE QMS_UOM ALTER COLUMN UOM_DESCRIPTION NVARCHAR(255);
    ALTER TABLE QMS_UOM ALTER COLUMN STATUS NVARCHAR(20);
    ALTER TABLE QMS_UOM ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_UOM ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_UOM', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_UOM ADD IS_ACTIVE BIT DEFAULT 1;

    -- Re-create unique constraint
    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('QMS_UOM') AND name = 'UQ_QMS_UOM_CODE')
    BEGIN
        ALTER TABLE QMS_UOM ADD CONSTRAINT UQ_QMS_UOM_CODE UNIQUE (UOM_CODE);
    END
END
GO

-- ==========================================================
-- 16. QMS_AUDIT_AREA Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_AUDIT_AREA', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_AREA', 'type', 'TYPE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_AREA', 'description', 'DESCRIPTION';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_AREA', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_AREA', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_AREA', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_AUDIT_AREA', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_AUDIT_AREA', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_AUDIT_AREA.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_AUDIT_AREA', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_AUDIT_AREA', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_AUDIT_AREA.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE QMS_AUDIT_AREA ALTER COLUMN TYPE NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_AREA ALTER COLUMN DESCRIPTION NVARCHAR(MAX);
    ALTER TABLE QMS_AUDIT_AREA ALTER COLUMN STATUS NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_AREA ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_AUDIT_AREA ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_AUDIT_AREA', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_AUDIT_AREA ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 17. QMS_AUDIT_SCHEDULE Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_AUDIT_SCHEDULE', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'schedule_no', 'SCHEDULE_NO';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'schedule_date', 'SCHEDULE_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'audit_type', 'AUDIT_TYPE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'item_code', 'ITEM_CODE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'audit_area', 'AUDIT_AREA';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'is_deleted', 'IS_DELETED';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'criteria_min_count', 'CRITERIA_MIN_COUNT';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'audit_date', 'AUDIT_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'audit_month', 'AUDIT_MONTH';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'start_time', 'START_TIME';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'end_time', 'END_TIME';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'department', 'DEPARTMENT';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'auditee', 'AUDITEE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'auditee_type', 'AUDITEE_TYPE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'auditee_details', 'AUDITEE_DETAILS';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'auditor', 'AUDITOR';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'auditor_type', 'AUDITOR_TYPE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'auditor_details', 'AUDITOR_DETAILS';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'ncr_approved_by', 'NCR_APPROVED_BY';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'ncr_approved_by_type', 'NCR_APPROVED_BY_TYPE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'ncr_approved_by_details', 'NCR_APPROVED_BY_DETAILS';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_AUDIT_SCHEDULE', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_AUDIT_SCHEDULE', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_AUDIT_SCHEDULE.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_AUDIT_SCHEDULE', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_AUDIT_SCHEDULE', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_AUDIT_SCHEDULE.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN SCHEDULE_NO NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN STATUS NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN AUDIT_TYPE NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN ITEM_CODE NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN AUDIT_AREA NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN IS_DELETED BIT NOT NULL;
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN AUDIT_MONTH NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN START_TIME NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN END_TIME NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN DEPARTMENT NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN AUDITEE NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN AUDITEE_TYPE NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN AUDITEE_DETAILS NVARCHAR(MAX);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN AUDITOR NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN AUDITOR_TYPE NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN AUDITOR_DETAILS NVARCHAR(MAX);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN NCR_APPROVED_BY NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN NCR_APPROVED_BY_TYPE NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN NCR_APPROVED_BY_DETAILS NVARCHAR(MAX);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_AUDIT_SCHEDULE ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_AUDIT_SCHEDULE', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_AUDIT_SCHEDULE ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 18. QMS_AUDIT_SCHEDULE_CRITERIA Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_AUDIT_SCHEDULE_CRITERIA', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE_CRITERIA', 'audit_schedule_id', 'AUDIT_SCHEDULE_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE_CRITERIA', 'seq_no', 'SEQ_NO';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE_CRITERIA', 'clause', 'CLAUSE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE_CRITERIA', 'criteria_details', 'CRITERIA_DETAILS';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE_CRITERIA', 'attachment_req', 'ATTACHMENT_REQ';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE_CRITERIA', 'remarks', 'REMARKS';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE_CRITERIA', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_SCHEDULE_CRITERIA', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_AUDIT_SCHEDULE_CRITERIA', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_AUDIT_SCHEDULE_CRITERIA', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_AUDIT_SCHEDULE_CRITERIA.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_AUDIT_SCHEDULE_CRITERIA', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_AUDIT_SCHEDULE_CRITERIA', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_AUDIT_SCHEDULE_CRITERIA.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE QMS_AUDIT_SCHEDULE_CRITERIA ALTER COLUMN SEQ_NO NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_SCHEDULE_CRITERIA ALTER COLUMN CLAUSE NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_SCHEDULE_CRITERIA ALTER COLUMN CRITERIA_DETAILS NVARCHAR(MAX);
    ALTER TABLE QMS_AUDIT_SCHEDULE_CRITERIA ALTER COLUMN ATTACHMENT_REQ NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_SCHEDULE_CRITERIA ALTER COLUMN REMARKS NVARCHAR(MAX);
    ALTER TABLE QMS_AUDIT_SCHEDULE_CRITERIA ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_AUDIT_SCHEDULE_CRITERIA ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_AUDIT_SCHEDULE_CRITERIA', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_AUDIT_SCHEDULE_CRITERIA ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 19. QMS_AUDIT_CRITERIA Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_AUDIT_CRITERIA', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_CRITERIA', 'seq_no', 'SEQ_NO';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_CRITERIA', 'audit_type', 'AUDIT_TYPE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_CRITERIA', 'clause', 'CLAUSE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_CRITERIA', 'criteria_text', 'CRITERIA_TEXT';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_CRITERIA', 'department', 'DEPARTMENT';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_CRITERIA', 'attachment_required', 'ATTACHMENT_REQUIRED';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_CRITERIA', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_CRITERIA', 'attachment_info', 'ATTACHMENT_INFO';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_CRITERIA', 'level', 'LEVEL';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_CRITERIA', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_CRITERIA', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_AUDIT_CRITERIA', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_AUDIT_CRITERIA', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_AUDIT_CRITERIA.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_AUDIT_CRITERIA', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_AUDIT_CRITERIA', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_AUDIT_CRITERIA.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE QMS_AUDIT_CRITERIA ALTER COLUMN SEQ_NO NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_CRITERIA ALTER COLUMN AUDIT_TYPE NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_CRITERIA ALTER COLUMN CLAUSE NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_CRITERIA ALTER COLUMN CRITERIA_TEXT NVARCHAR(MAX);
    ALTER TABLE QMS_AUDIT_CRITERIA ALTER COLUMN DEPARTMENT NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_CRITERIA ALTER COLUMN ATTACHMENT_REQUIRED NVARCHAR(20);
    ALTER TABLE QMS_AUDIT_CRITERIA ALTER COLUMN STATUS NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_CRITERIA ALTER COLUMN ATTACHMENT_INFO NVARCHAR(MAX);
    ALTER TABLE QMS_AUDIT_CRITERIA ALTER COLUMN LEVEL NVARCHAR(100);
    ALTER TABLE QMS_AUDIT_CRITERIA ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_AUDIT_CRITERIA ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_AUDIT_CRITERIA', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_AUDIT_CRITERIA ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 20. QMS_AUDIT_ATTENDANCE Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_AUDIT_ATTENDANCE', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_ATTENDANCE', 'audit_schedule_no', 'AUDIT_SCHEDULE_NO';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_ATTENDANCE', 'name', 'NAME';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_ATTENDANCE', 'employee_code', 'EMPLOYEE_CODE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_ATTENDANCE', 'in_time', 'IN_TIME';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_ATTENDANCE', 'out_time', 'OUT_TIME';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_ATTENDANCE', 'attendance_status', 'ATTENDANCE_STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_ATTENDANCE', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_ATTENDANCE', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_AUDIT_ATTENDANCE', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_AUDIT_ATTENDANCE', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_AUDIT_ATTENDANCE.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_AUDIT_ATTENDANCE', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_AUDIT_ATTENDANCE', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_AUDIT_ATTENDANCE.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE QMS_AUDIT_ATTENDANCE ALTER COLUMN AUDIT_SCHEDULE_NO NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_ATTENDANCE ALTER COLUMN NAME NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_ATTENDANCE ALTER COLUMN EMPLOYEE_CODE NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_ATTENDANCE ALTER COLUMN IN_TIME NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_ATTENDANCE ALTER COLUMN OUT_TIME NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_ATTENDANCE ALTER COLUMN ATTENDANCE_STATUS NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_ATTENDANCE ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_AUDIT_ATTENDANCE ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_AUDIT_ATTENDANCE', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_AUDIT_ATTENDANCE ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 21. QMS_AUDIT_OBSERVATION Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_AUDIT_OBSERVATION', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION', 'observation_no', 'OBSERVATION_NO';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION', 'observation_date', 'OBSERVATION_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION', 'audit_schedule_no', 'AUDIT_SCHEDULE_NO';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION', 'audit_type', 'AUDIT_TYPE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION', 'audit_area', 'AUDIT_AREA';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION', 'department_name', 'DEPARTMENT_NAME';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION', 'auditee', 'AUDITEE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION', 'auditor', 'AUDITOR';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION', 'ncr_approved_by', 'NCR_APPROVED_BY';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION', 'audit_score', 'AUDIT_SCORE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION', 'ofi_count', 'OFI_COUNT';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION', 'compliance_count', 'COMPLIANCE_COUNT';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION', 'ncr_count', 'NCR_COUNT';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_AUDIT_OBSERVATION', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_AUDIT_OBSERVATION', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_AUDIT_OBSERVATION.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_AUDIT_OBSERVATION', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_AUDIT_OBSERVATION', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_AUDIT_OBSERVATION.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE QMS_AUDIT_OBSERVATION ALTER COLUMN OBSERVATION_NO NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_OBSERVATION ALTER COLUMN AUDIT_SCHEDULE_NO NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_OBSERVATION ALTER COLUMN AUDIT_TYPE NVARCHAR(100);
    ALTER TABLE QMS_AUDIT_OBSERVATION ALTER COLUMN AUDIT_AREA NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_OBSERVATION ALTER COLUMN DEPARTMENT_NAME NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_OBSERVATION ALTER COLUMN AUDITEE NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_OBSERVATION ALTER COLUMN AUDITOR NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_OBSERVATION ALTER COLUMN NCR_APPROVED_BY NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_OBSERVATION ALTER COLUMN STATUS NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_OBSERVATION ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_AUDIT_OBSERVATION ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_AUDIT_OBSERVATION', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_AUDIT_OBSERVATION ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 22. QMS_AUDIT_OBSERVATION_DETAIL Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_AUDIT_OBSERVATION_DETAIL', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'observation_id', 'OBSERVATION_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'ncr_no', 'NCR_NO';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'seq_no', 'SEQ_NO';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'clause', 'CLAUSE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'criteria_details', 'CRITERIA_DETAILS';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'attachment_req', 'ATTACHMENT_REQ';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'attachment_path', 'ATTACHMENT_PATH';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'observation_status', 'OBSERVATION_STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'approval_status', 'APPROVAL_STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'comments', 'COMMENTS';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'root_cause', 'ROOT_CAUSE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'corrective_action', 'CORRECTIVE_ACTION';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'preventive_action', 'PREVENTIVE_ACTION';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'target_date', 'TARGET_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'closed_date', 'CLOSED_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'closed_by', 'CLOSED_BY';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'ncr_status', 'NCR_STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_OBSERVATION_DETAIL', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_AUDIT_OBSERVATION_DETAIL', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_AUDIT_OBSERVATION_DETAIL', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_AUDIT_OBSERVATION_DETAIL.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_AUDIT_OBSERVATION_DETAIL', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_AUDIT_OBSERVATION_DETAIL', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_AUDIT_OBSERVATION_DETAIL.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE QMS_AUDIT_OBSERVATION_DETAIL ALTER COLUMN NCR_NO NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_OBSERVATION_DETAIL ALTER COLUMN SEQ_NO NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_OBSERVATION_DETAIL ALTER COLUMN CLAUSE NVARCHAR(100);
    ALTER TABLE QMS_AUDIT_OBSERVATION_DETAIL ALTER COLUMN CRITERIA_DETAILS NVARCHAR(MAX);
    ALTER TABLE QMS_AUDIT_OBSERVATION_DETAIL ALTER COLUMN ATTACHMENT_REQ NVARCHAR(10);
    ALTER TABLE QMS_AUDIT_OBSERVATION_DETAIL ALTER COLUMN ATTACHMENT_PATH NVARCHAR(1000);
    ALTER TABLE QMS_AUDIT_OBSERVATION_DETAIL ALTER COLUMN OBSERVATION_STATUS NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_OBSERVATION_DETAIL ALTER COLUMN APPROVAL_STATUS NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_OBSERVATION_DETAIL ALTER COLUMN COMMENTS NVARCHAR(MAX);
    ALTER TABLE QMS_AUDIT_OBSERVATION_DETAIL ALTER COLUMN ROOT_CAUSE NVARCHAR(MAX);
    ALTER TABLE QMS_AUDIT_OBSERVATION_DETAIL ALTER COLUMN CORRECTIVE_ACTION NVARCHAR(MAX);
    ALTER TABLE QMS_AUDIT_OBSERVATION_DETAIL ALTER COLUMN PREVENTIVE_ACTION NVARCHAR(MAX);
    ALTER TABLE QMS_AUDIT_OBSERVATION_DETAIL ALTER COLUMN CLOSED_BY NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_OBSERVATION_DETAIL ALTER COLUMN NCR_STATUS NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_OBSERVATION_DETAIL ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_AUDIT_OBSERVATION_DETAIL ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_AUDIT_OBSERVATION_DETAIL', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_AUDIT_OBSERVATION_DETAIL ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 23. QMS_AUDIT_TYPE Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_AUDIT_TYPE', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_TYPE', 'audit_type', 'AUDIT_TYPE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_TYPE', 'standard', 'STANDARD';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_TYPE', 'description', 'DESCRIPTION';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_TYPE', 'criteria_min_count', 'CRITERIA_MIN_COUNT';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_TYPE', 'customer_audit_area', 'CUSTOMER_AUDIT_AREA';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_TYPE', 'audit_area', 'AUDIT_AREA';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_TYPE', 'criteria_type', 'CRITERIA_TYPE';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_TYPE', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_TYPE', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_AUDIT_TYPE', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_AUDIT_TYPE', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_AUDIT_TYPE', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_AUDIT_TYPE.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_AUDIT_TYPE', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_AUDIT_TYPE', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_AUDIT_TYPE.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE QMS_AUDIT_TYPE ALTER COLUMN AUDIT_TYPE NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_TYPE ALTER COLUMN STANDARD NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_TYPE ALTER COLUMN DESCRIPTION NVARCHAR(MAX);
    ALTER TABLE QMS_AUDIT_TYPE ALTER COLUMN CUSTOMER_AUDIT_AREA NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_TYPE ALTER COLUMN AUDIT_AREA NVARCHAR(255);
    ALTER TABLE QMS_AUDIT_TYPE ALTER COLUMN CRITERIA_TYPE NVARCHAR(100);
    ALTER TABLE QMS_AUDIT_TYPE ALTER COLUMN STATUS NVARCHAR(50);
    ALTER TABLE QMS_AUDIT_TYPE ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_AUDIT_TYPE ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_AUDIT_TYPE', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_AUDIT_TYPE ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 24. QMS_NCR_OFI_MASTER Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_NCR_OFI_MASTER', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_MASTER', 'ncr_ofi_no', 'NCR_OFI_NO';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_MASTER', 'observation_id', 'OBSERVATION_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_MASTER', 'observation_detail_id', 'OBSERVATION_DETAIL_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_MASTER', 'type', 'TYPE';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_MASTER', 'observation_date', 'OBSERVATION_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_MASTER', 'target_date', 'TARGET_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_MASTER', 'ncr_approver_id', 'NCR_APPROVER_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_MASTER', 'auditee_name', 'AUDITEE_NAME';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_MASTER', 'ncr_approver_name', 'NCR_APPROVER_NAME';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_MASTER', 'root_cause', 'ROOT_CAUSE';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_MASTER', 'corrective_action', 'CORRECTIVE_ACTION';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_MASTER', 'preventive_action', 'PREVENTIVE_ACTION';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_MASTER', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_MASTER', 'approval_status', 'APPROVAL_STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_MASTER', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_MASTER', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_NCR_OFI_MASTER', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_NCR_OFI_MASTER', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_NCR_OFI_MASTER.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_NCR_OFI_MASTER', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_NCR_OFI_MASTER', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_NCR_OFI_MASTER.updated_at', 'UPDATED_DATE', 'COLUMN';

    -- Drop unique constraint/index on NCR_OFI_NO dynamically to allow type alteration
    DECLARE @drop_uq_ncr NVARCHAR(MAX) = N'';
    SELECT @drop_uq_ncr += N'ALTER TABLE [QMS_NCR_OFI_MASTER] DROP CONSTRAINT ' + QUOTENAME(dc.name) + ';' + CHAR(13) + CHAR(10)
    FROM sys.key_constraints dc
    INNER JOIN sys.index_columns ic ON dc.parent_object_id = ic.object_id AND dc.unique_index_id = ic.index_id
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE dc.parent_object_id = OBJECT_ID('QMS_NCR_OFI_MASTER')
      AND c.name = 'NCR_OFI_NO';
    IF @drop_uq_ncr <> N'' EXEC sp_executesql @drop_uq_ncr;

    DECLARE @drop_idx_ncr NVARCHAR(MAX) = N'';
    SELECT @drop_idx_ncr += N'DROP INDEX ' + QUOTENAME(i.name) + ' ON [QMS_NCR_OFI_MASTER];' + CHAR(13) + CHAR(10)
    FROM sys.indexes i
    INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE i.object_id = OBJECT_ID('QMS_NCR_OFI_MASTER')
      AND c.name = 'NCR_OFI_NO'
      AND i.is_primary_key = 0
      AND i.is_unique_constraint = 0;
    IF @drop_idx_ncr <> N'' EXEC sp_executesql @drop_idx_ncr;

    ALTER TABLE QMS_NCR_OFI_MASTER ALTER COLUMN NCR_OFI_NO NVARCHAR(50) NOT NULL;
    ALTER TABLE QMS_NCR_OFI_MASTER ALTER COLUMN OBSERVATION_ID INT NOT NULL;
    ALTER TABLE QMS_NCR_OFI_MASTER ALTER COLUMN OBSERVATION_DETAIL_ID INT NOT NULL;
    ALTER TABLE QMS_NCR_OFI_MASTER ALTER COLUMN TYPE NVARCHAR(50) NOT NULL;
    ALTER TABLE QMS_NCR_OFI_MASTER ALTER COLUMN NCR_APPROVER_ID INT;
    ALTER TABLE QMS_NCR_OFI_MASTER ALTER COLUMN AUDITEE_NAME NVARCHAR(255);
    ALTER TABLE QMS_NCR_OFI_MASTER ALTER COLUMN NCR_APPROVER_NAME NVARCHAR(255);
    ALTER TABLE QMS_NCR_OFI_MASTER ALTER COLUMN ROOT_CAUSE NVARCHAR(MAX);
    ALTER TABLE QMS_NCR_OFI_MASTER ALTER COLUMN CORRECTIVE_ACTION NVARCHAR(MAX);
    ALTER TABLE QMS_NCR_OFI_MASTER ALTER COLUMN PREVENTIVE_ACTION NVARCHAR(MAX);
    ALTER TABLE QMS_NCR_OFI_MASTER ALTER COLUMN STATUS NVARCHAR(50);
    ALTER TABLE QMS_NCR_OFI_MASTER ALTER COLUMN APPROVAL_STATUS NVARCHAR(50);
    ALTER TABLE QMS_NCR_OFI_MASTER ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_NCR_OFI_MASTER ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_NCR_OFI_MASTER', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_NCR_OFI_MASTER ADD IS_ACTIVE BIT DEFAULT 1;

    -- Re-create unique constraint
    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('QMS_NCR_OFI_MASTER') AND name = 'UQ_QMS_NCR_OFI_NO')
    BEGIN
        ALTER TABLE QMS_NCR_OFI_MASTER ADD CONSTRAINT UQ_QMS_NCR_OFI_NO UNIQUE (NCR_OFI_NO);
    END
END
GO

-- PK
IF OBJECT_ID('QMS_NCR_OFI_MASTER', 'U') IS NOT NULL
BEGIN
    DECLARE @ncr_pk NVARCHAR(255);
    SELECT TOP 1 @ncr_pk = name FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('QMS_NCR_OFI_MASTER') AND type = 'PK';
    IF @ncr_pk IS NOT NULL AND @ncr_pk <> 'PK_QMS_NCR_OFI_MASTER'
    BEGIN
        DECLARE @drop_ncr_pk NVARCHAR(MAX) = 'ALTER TABLE QMS_NCR_OFI_MASTER DROP CONSTRAINT ' + @ncr_pk;
        EXEC(@drop_ncr_pk);
    END
    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('QMS_NCR_OFI_MASTER') AND name = 'PK_QMS_NCR_OFI_MASTER')
    BEGIN
        ALTER TABLE QMS_NCR_OFI_MASTER ADD CONSTRAINT PK_QMS_NCR_OFI_MASTER PRIMARY KEY (id);
    END
END
GO

-- ==========================================================
-- 25. QMS_NCR_OFI_ACTION Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_NCR_OFI_ACTION', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_ACTION', 'ncr_ofi_id', 'NCR_OFI_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_ACTION', 'action_type', 'ACTION_TYPE';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_ACTION', 'action_description', 'ACTION_DESCRIPTION';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_ACTION', 'action_by', 'ACTION_BY';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_ACTION', 'action_date', 'ACTION_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_ACTION', 'completion_date', 'COMPLETION_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_ACTION', 'remarks', 'REMARKS';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_ACTION', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_ACTION', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_ACTION', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_NCR_OFI_ACTION', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_NCR_OFI_ACTION', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_NCR_OFI_ACTION.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_NCR_OFI_ACTION', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_NCR_OFI_ACTION', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_NCR_OFI_ACTION.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE QMS_NCR_OFI_ACTION ALTER COLUMN NCR_OFI_ID INT NOT NULL;
    ALTER TABLE QMS_NCR_OFI_ACTION ALTER COLUMN ACTION_TYPE NVARCHAR(50);
    ALTER TABLE QMS_NCR_OFI_ACTION ALTER COLUMN ACTION_DESCRIPTION NVARCHAR(MAX);
    ALTER TABLE QMS_NCR_OFI_ACTION ALTER COLUMN REMARKS NVARCHAR(MAX);
    ALTER TABLE QMS_NCR_OFI_ACTION ALTER COLUMN STATUS NVARCHAR(50);
    ALTER TABLE QMS_NCR_OFI_ACTION ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_NCR_OFI_ACTION ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_NCR_OFI_ACTION', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_NCR_OFI_ACTION ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 26. QMS_NCR_OFI_APPROVAL Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_NCR_OFI_APPROVAL', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_APPROVAL', 'ncr_ofi_id', 'NCR_OFI_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_APPROVAL', 'approver_id', 'APPROVER_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_APPROVAL', 'approval_role', 'APPROVAL_ROLE';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_APPROVAL', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_APPROVAL', 'comments', 'COMMENTS';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_APPROVAL', 'approval_date', 'APPROVAL_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_APPROVAL', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_APPROVAL', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_NCR_OFI_APPROVAL', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_NCR_OFI_APPROVAL', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_NCR_OFI_APPROVAL.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_NCR_OFI_APPROVAL', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_NCR_OFI_APPROVAL', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_NCR_OFI_APPROVAL.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE QMS_NCR_OFI_APPROVAL ALTER COLUMN NCR_OFI_ID INT NOT NULL;
    ALTER TABLE QMS_NCR_OFI_APPROVAL ALTER COLUMN APPROVER_ID INT NOT NULL;
    ALTER TABLE QMS_NCR_OFI_APPROVAL ALTER COLUMN APPROVAL_ROLE NVARCHAR(50);
    ALTER TABLE QMS_NCR_OFI_APPROVAL ALTER COLUMN STATUS NVARCHAR(50);
    ALTER TABLE QMS_NCR_OFI_APPROVAL ALTER COLUMN COMMENTS NVARCHAR(MAX);
    ALTER TABLE QMS_NCR_OFI_APPROVAL ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_NCR_OFI_APPROVAL ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_NCR_OFI_APPROVAL', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_NCR_OFI_APPROVAL ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 27. QMS_NCR_OFI_ATTACHMENT Column Standardization
-- ==========================================================
IF OBJECT_ID('QMS_NCR_OFI_ATTACHMENT', 'U') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_ATTACHMENT', 'ncr_ofi_id', 'NCR_OFI_ID';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_ATTACHMENT', 'file_name', 'FILE_NAME';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_ATTACHMENT', 'file_path', 'FILE_PATH';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_ATTACHMENT', 'file_type', 'FILE_TYPE';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_ATTACHMENT', 'uploaded_by', 'UPLOADED_BY';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_ATTACHMENT', 'uploaded_date', 'UPLOADED_DATE';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_ATTACHMENT', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'QMS_NCR_OFI_ATTACHMENT', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('QMS_NCR_OFI_ATTACHMENT', 'created_at') IS NOT NULL AND COL_LENGTH('QMS_NCR_OFI_ATTACHMENT', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_NCR_OFI_ATTACHMENT.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('QMS_NCR_OFI_ATTACHMENT', 'updated_at') IS NOT NULL AND COL_LENGTH('QMS_NCR_OFI_ATTACHMENT', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'QMS_NCR_OFI_ATTACHMENT.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE QMS_NCR_OFI_ATTACHMENT ALTER COLUMN NCR_OFI_ID INT NOT NULL;
    ALTER TABLE QMS_NCR_OFI_ATTACHMENT ALTER COLUMN FILE_NAME NVARCHAR(255);
    ALTER TABLE QMS_NCR_OFI_ATTACHMENT ALTER COLUMN FILE_PATH NVARCHAR(1000);
    ALTER TABLE QMS_NCR_OFI_ATTACHMENT ALTER COLUMN FILE_TYPE NVARCHAR(50);
    ALTER TABLE QMS_NCR_OFI_ATTACHMENT ALTER COLUMN UPLOADED_BY NVARCHAR(100);
    ALTER TABLE QMS_NCR_OFI_ATTACHMENT ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE QMS_NCR_OFI_ATTACHMENT ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('QMS_NCR_OFI_ATTACHMENT', 'IS_ACTIVE') IS NULL
        ALTER TABLE QMS_NCR_OFI_ATTACHMENT ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 28. Cleanup standard procedure
-- ==========================================================
IF OBJECT_ID('dbo.sp_RenameColumnCS', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_RenameColumnCS;
GO

-- ==========================================================
-- 29. Re-establish Clean Foreign Key Constraints
-- ==========================================================
IF OBJECT_ID('QMS_CHECKLIST_ASSIGNMENT', 'U') IS NOT NULL AND OBJECT_ID('QMS_CHECKLIST', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_QMS_CHECKLIST_ASSIGN_CHECKLIST' AND parent_object_id = OBJECT_ID('QMS_CHECKLIST_ASSIGNMENT'))
    BEGIN
        ALTER TABLE QMS_CHECKLIST_ASSIGNMENT ADD CONSTRAINT FK_QMS_CHECKLIST_ASSIGN_CHECKLIST FOREIGN KEY (CHECKLIST_ID) REFERENCES QMS_CHECKLIST(id);
    END
END
GO

IF OBJECT_ID('QMS_CHECKLIST_CLOSED', 'U') IS NOT NULL AND OBJECT_ID('QMS_CHECKLIST', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_QMS_CHECKLIST_CLOSED_CHECKLIST' AND parent_object_id = OBJECT_ID('QMS_CHECKLIST_CLOSED'))
    BEGIN
        ALTER TABLE QMS_CHECKLIST_CLOSED ADD CONSTRAINT FK_QMS_CHECKLIST_CLOSED_CHECKLIST FOREIGN KEY (CHECKLIST_ID) REFERENCES QMS_CHECKLIST(id);
    END
END
GO

IF OBJECT_ID('QMS_CHECKLIST_DEPARTMENT', 'U') IS NOT NULL AND OBJECT_ID('QMS_CHECKLIST', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_QMS_CHECKLIST_DEPT_CHECKLIST' AND parent_object_id = OBJECT_ID('QMS_CHECKLIST_DEPARTMENT'))
    BEGIN
        ALTER TABLE QMS_CHECKLIST_DEPARTMENT ADD CONSTRAINT FK_QMS_CHECKLIST_DEPT_CHECKLIST FOREIGN KEY (CHECKLIST_ID) REFERENCES QMS_CHECKLIST(id);
    END
END
GO

IF OBJECT_ID('QMS_MEETING_SCHEDULE', 'U') IS NOT NULL AND OBJECT_ID('QMS_MEETING', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_QMS_MEETING_SCHEDULE_TYPE' AND parent_object_id = OBJECT_ID('QMS_MEETING_SCHEDULE'))
    BEGIN
        ALTER TABLE QMS_MEETING_SCHEDULE ADD CONSTRAINT FK_QMS_MEETING_SCHEDULE_TYPE FOREIGN KEY (MEETING_TYPE_ID) REFERENCES QMS_MEETING(id);
    END
END
GO

IF OBJECT_ID('QMS_MEETING_SCHEDULE_DEPARTMENT', 'U') IS NOT NULL AND OBJECT_ID('QMS_MEETING_SCHEDULE', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_QMS_MEETING_SCH_DEPT_SCHEDULE' AND parent_object_id = OBJECT_ID('QMS_MEETING_SCHEDULE_DEPARTMENT'))
    BEGIN
        ALTER TABLE QMS_MEETING_SCHEDULE_DEPARTMENT ADD CONSTRAINT FK_QMS_MEETING_SCH_DEPT_SCHEDULE FOREIGN KEY (SCHEDULE_ID) REFERENCES QMS_MEETING_SCHEDULE(id);
    END
END
GO

IF OBJECT_ID('QMS_MEETING_SCHEDULE_PARTICIPANT', 'U') IS NOT NULL AND OBJECT_ID('QMS_MEETING_SCHEDULE', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_QMS_MEETING_SCH_PART_SCHEDULE' AND parent_object_id = OBJECT_ID('QMS_MEETING_SCHEDULE_PARTICIPANT'))
    BEGIN
        ALTER TABLE QMS_MEETING_SCHEDULE_PARTICIPANT ADD CONSTRAINT FK_QMS_MEETING_SCH_PART_SCHEDULE FOREIGN KEY (SCHEDULE_ID) REFERENCES QMS_MEETING_SCHEDULE(id);
    END
END
GO

IF OBJECT_ID('QMS_MEETING_USER_ATTENDANCE', 'U') IS NOT NULL AND OBJECT_ID('QMS_MEETING_SCHEDULE', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_QMS_MEETING_USER_ATT_SCHEDULE' AND parent_object_id = OBJECT_ID('QMS_MEETING_USER_ATTENDANCE'))
    BEGIN
        ALTER TABLE QMS_MEETING_USER_ATTENDANCE ADD CONSTRAINT FK_QMS_MEETING_USER_ATT_SCHEDULE FOREIGN KEY (SCHEDULE_ID) REFERENCES QMS_MEETING_SCHEDULE(id);
    END
END
GO

IF OBJECT_ID('QMS_MOM', 'U') IS NOT NULL AND OBJECT_ID('QMS_MEETING_SCHEDULE', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_QMS_MOM_SCHEDULE' AND parent_object_id = OBJECT_ID('QMS_MOM'))
    BEGIN
        ALTER TABLE QMS_MOM ADD CONSTRAINT FK_QMS_MOM_SCHEDULE FOREIGN KEY (SCHEDULE_ID) REFERENCES QMS_MEETING_SCHEDULE(id);
    END
END
GO

IF OBJECT_ID('QMS_MOM_ATTENDANCE', 'U') IS NOT NULL AND OBJECT_ID('QMS_MOM', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_QMS_MOM_ATTENDANCE_MOM' AND parent_object_id = OBJECT_ID('QMS_MOM_ATTENDANCE'))
    BEGIN
        ALTER TABLE QMS_MOM_ATTENDANCE ADD CONSTRAINT FK_QMS_MOM_ATTENDANCE_MOM FOREIGN KEY (MOM_ID) REFERENCES QMS_MOM(id);
    END
END
GO

IF OBJECT_ID('QMS_MOM_DETAIL', 'U') IS NOT NULL AND OBJECT_ID('QMS_MOM', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_QMS_MOM_DETAIL_MOM' AND parent_object_id = OBJECT_ID('QMS_MOM_DETAIL'))
    BEGIN
        ALTER TABLE QMS_MOM_DETAIL ADD CONSTRAINT FK_QMS_MOM_DETAIL_MOM FOREIGN KEY (MOM_ID) REFERENCES QMS_MOM(id);
    END
END
GO

IF OBJECT_ID('QMS_AUDIT_SCHEDULE_CRITERIA', 'U') IS NOT NULL AND OBJECT_ID('QMS_AUDIT_SCHEDULE', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_QMS_AUDIT_SCH_CRIT_SCHEDULE' AND parent_object_id = OBJECT_ID('QMS_AUDIT_SCHEDULE_CRITERIA'))
    BEGIN
        ALTER TABLE QMS_AUDIT_SCHEDULE_CRITERIA ADD CONSTRAINT FK_QMS_AUDIT_SCH_CRIT_SCHEDULE FOREIGN KEY (AUDIT_SCHEDULE_ID) REFERENCES QMS_AUDIT_SCHEDULE(id);
    END
END
GO

IF OBJECT_ID('QMS_AUDIT_OBSERVATION_DETAIL', 'U') IS NOT NULL AND OBJECT_ID('QMS_AUDIT_OBSERVATION', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_QMS_AUDIT_OBS_DET_OBSERVATION' AND parent_object_id = OBJECT_ID('QMS_AUDIT_OBSERVATION_DETAIL'))
    BEGIN
        ALTER TABLE QMS_AUDIT_OBSERVATION_DETAIL ADD CONSTRAINT FK_QMS_AUDIT_OBS_DET_OBSERVATION FOREIGN KEY (OBSERVATION_ID) REFERENCES QMS_AUDIT_OBSERVATION(id);
    END
END
GO

IF OBJECT_ID('QMS_NCR_OFI_ATTACHMENT', 'U') IS NOT NULL AND OBJECT_ID('QMS_NCR_OFI_MASTER', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_QMS_NCR_OFI_ATTACHMENT_MASTER' AND parent_object_id = OBJECT_ID('QMS_NCR_OFI_ATTACHMENT'))
    BEGIN
        ALTER TABLE QMS_NCR_OFI_ATTACHMENT ADD CONSTRAINT FK_QMS_NCR_OFI_ATTACHMENT_MASTER FOREIGN KEY (NCR_OFI_ID) REFERENCES QMS_NCR_OFI_MASTER(id);
    END
END
GO
