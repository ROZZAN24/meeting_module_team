-- QMS Checklist Module Schema (SQL Server & H2 Compatible)
-- Centralized reference schema representing the active QMS Checklist tables.
-- Database: AUTONOMA

-- ─── 1. CENTRALIZED STATUS MASTER TABLE ─────────────────────────────────────
CREATE TABLE [dbo].[AD_STATUS_MASTER] (
    [id]   BIGINT IDENTITY(1,1) PRIMARY KEY,
    [NAME] NVARCHAR(100) NOT NULL UNIQUE
);

-- ─── 2. QMS CHECKLIST MASTER TABLE (Definitions & Configurations) ───────────
CREATE TABLE [dbo].[QMS_CHECKLIST_MASTER] (
    [id]                    BIGINT IDENTITY(1,1) PRIMARY KEY,
    [SEQ_NO]                NVARCHAR(50),
    [CHECKING_POINT]        NVARCHAR(255) NOT NULL,
    [DESCRIPTION]           NVARCHAR(MAX),
    [CATEGORY]              NVARCHAR(50), -- RENEWAL or CHECK LIST
    [FREQUENCY]             NVARCHAR(50), -- DAILY, WEEKLY, MONTHLY, etc.
    [WEEK_DAYS]             NVARCHAR(100),
    [REPEAT_EVERY_VALUE]    INT,
    [REPEAT_EVERY_UNIT]     NVARCHAR(50),
    [EFFECTIVE_FROM]        DATE,
    [EXPIRY_DATE]           DATE,
    [REMINDER_DAYS]         INT,
    [REMINDER_DATE]         DATE,
    [STOCK_LINK]            NVARCHAR(10),
    [PHOTO_REQUIRED]        NVARCHAR(10),
    [VERIFICATION_REQUIRED] NVARCHAR(10),
    [LAST_COMPLETED_DATE]   DATE,
    [NEXT_DUE_DATE]         DATE,
    [DUAL_CHECK]            NVARCHAR(10),
    [CARRY_FORWARD]         NVARCHAR(10),
    [CARRY_FORWARD_STATUS]  NVARCHAR(10),
    [AMENDMENT_REASON]      NVARCHAR(MAX),
    [LEVEL_IDS]             NVARCHAR(100),
    [UPLOADED_FILES]        NVARCHAR(MAX),
    [SCANNED_FILES]         NVARCHAR(MAX),
    [STATUS]                NVARCHAR(50), -- Lifecycle Status (e.g. Active)
    [TASK_STATUS]           NVARCHAR(50), -- Running Status (e.g. Pending, Completed)
    [VERIFY_STATUS]         NVARCHAR(50), -- Verification Status (e.g. Verified)
    [VERIFIED_BY]           NVARCHAR(100),
    [VERIFIED_DATE]         DATETIME,
    [REJ_REASON]            NVARCHAR(255),
    [ASSIGN_TO]             NVARCHAR(255),
    [ASSIGN_DATE]           DATE,
    [ITEM_CODE]             NVARCHAR(100),
    [QTY]                   NVARCHAR(50),
    -- Central Audit Fields
    [CREATED_USER]          NVARCHAR(100),
    [CREATED_DATE]          DATETIME DEFAULT GETDATE(),
    [UPDATED_USER]          NVARCHAR(100),
    [UPDATED_DATE]          DATETIME
);

-- ─── 3. QMS CHECKLIST DEPARTMENT TABLE (Mapping checklists to departments) ─
CREATE TABLE [dbo].[QMS_CHECKLIST_DEPARTMENT] (
    [id]            BIGINT IDENTITY(1,1) PRIMARY KEY,
    [checklist_id]  BIGINT NOT NULL,
    [department_id] BIGINT NOT NULL,
    CONSTRAINT [FK_Dept_Checklist_Master] FOREIGN KEY ([checklist_id]) 
        REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Dept_Department_Master] FOREIGN KEY ([department_id])
        REFERENCES [dbo].[HR_DEPARTMENT_MASTER]([id]) ON DELETE CASCADE
);

-- ─── 4. QMS CHECKLIST ASSIGNMENT TABLE (Active checklist assignments) ──────
CREATE TABLE [dbo].[QMS_CHECKLIST_ASSIGNMENT] (
    [id]                   BIGINT IDENTITY(1,1) PRIMARY KEY,
    [CHECKLIST_ID]         BIGINT NOT NULL,
    [ASSIGNED_TO]          NVARCHAR(100),
    [ASSIGNED_BY]          NVARCHAR(100),
    [ASSIGNED_DATE]        DATETIME,
    [STATUS_ID]            BIGINT,
    [REMARKS]              NVARCHAR(MAX),
    [CHECKLIST_DATE]       DATE,
    [CARRY_FORWARD]        NVARCHAR(10),
    [CARRY_FORWARD_STATUS] NVARCHAR(10),
    [CARRY_FORWARD_COUNT]  INT DEFAULT 0,
    [ASSIGN_TYPE]          NVARCHAR(50),
    [VERIFIED_BY]          NVARCHAR(100),
    [VERIFIED_DATE]        DATETIME,
    [COMMENTS]             NVARCHAR(MAX),
    [FILE_PATHS]           NVARCHAR(MAX),
    -- Central Audit Fields
    [CREATED_USER]         NVARCHAR(100),
    [CREATED_DATE]         DATETIME DEFAULT GETDATE(),
    [UPDATED_USER]         NVARCHAR(100),
    [UPDATED_DATE]         DATETIME,
    CONSTRAINT [FK_Assignment_Checklist_Master] FOREIGN KEY ([CHECKLIST_ID]) 
        REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Assignment_Status] FOREIGN KEY ([STATUS_ID]) 
        REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);

-- ─── 5. QMS CHECKLIST ASSIGNMENT FILES TABLE (Linked actual attachments) ───
CREATE TABLE [dbo].[QMS_CHECKLIST_ASSIGNMENT_FILES] (
    [id]            BIGINT IDENTITY(1,1) PRIMARY KEY,
    [ASSIGNMENT_ID] BIGINT NOT NULL,
    [FILE_PATH]     NVARCHAR(MAX),
    -- Central Audit Fields
    [CREATED_USER]  NVARCHAR(100),
    [CREATED_DATE]  DATETIME DEFAULT GETDATE(),
    [UPDATED_USER]  NVARCHAR(100),
    [UPDATED_DATE]  DATETIME,
    CONSTRAINT [FK_Files_Assignment] FOREIGN KEY ([ASSIGNMENT_ID]) 
        REFERENCES [dbo].[QMS_CHECKLIST_ASSIGNMENT]([id]) ON DELETE CASCADE
);

-- ─── 6. QMS CHECKLIST CLOSED TABLE (Consolidated historical executions) ────
CREATE TABLE [dbo].[QMS_CHECKLIST_CLOSED] (
    [id]                   BIGINT IDENTITY(1,1) PRIMARY KEY,
    [checklist_id]         BIGINT,
    [assigned_to]          NVARCHAR(100),
    [assigned_by]          NVARCHAR(100),
    [assigned_date]        DATETIME,
    [status_id]            BIGINT,
    [remarks]              NVARCHAR(MAX),
    [checklist_date]       DATE,
    [carry_forward]        NVARCHAR(10),
    [carry_forward_status] NVARCHAR(10),
    [carry_forward_count]  INT DEFAULT 0,
    [assign_type]          NVARCHAR(50),
    [verified_by]          NVARCHAR(100),
    [verified_date]        DATETIME,
    [comments]             NVARCHAR(MAX),
    [file_paths]           NVARCHAR(MAX),
    [frequency]            NVARCHAR(50) NOT NULL, -- Centralized column (DAILY, WEEKLY, etc.)
    -- Central Audit Fields
    [CREATED_USER]         NVARCHAR(100),
    [CREATED_DATE]         DATETIME DEFAULT GETDATE(),
    [UPDATED_USER]         NVARCHAR(100),
    [UPDATED_DATE]         DATETIME,
    CONSTRAINT [FK_Closed_Checklist] FOREIGN KEY ([checklist_id]) 
        REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE SET NULL,
    CONSTRAINT [FK_Closed_Status] FOREIGN KEY ([status_id]) 
        REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);

