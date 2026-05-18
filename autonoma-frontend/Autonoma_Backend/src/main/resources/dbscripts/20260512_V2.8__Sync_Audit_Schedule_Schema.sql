-- V2.8 Sync Audit Schedule Schema
-- Add missing columns to audit_schedules
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'scheduleDate')
BEGIN
    ALTER TABLE [dbo].[audit_schedules] ADD [scheduleDate] DATE;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'itemCode')
BEGIN
    ALTER TABLE [dbo].[audit_schedules] ADD [itemCode] NVARCHAR(255);
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'isDeleted')
BEGIN
    ALTER TABLE [dbo].[audit_schedules] ADD [isDeleted] BIT DEFAULT 0;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditMonth')
BEGIN
    ALTER TABLE [dbo].[audit_schedules] ADD [auditMonth] NVARCHAR(50);
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'startTime')
BEGIN
    ALTER TABLE [dbo].[audit_schedules] ADD [startTime] NVARCHAR(50);
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'endTime')
BEGIN
    ALTER TABLE [dbo].[audit_schedules] ADD [endTime] NVARCHAR(50);
END

-- Create audit_schedule_criteria table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedule_criteria]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[audit_schedule_criteria] (
        [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
        [audit_schedule_id] BIGINT NOT NULL,
        [seqNo] NVARCHAR(50),
        [clause] NVARCHAR(255),
        [criteriaDetails] NVARCHAR(MAX),
        [attachmentReq] NVARCHAR(50),
        [remarks] NVARCHAR(MAX),
        CONSTRAINT [FK_AuditSchedule_Criteria] FOREIGN KEY ([audit_schedule_id]) REFERENCES [dbo].[audit_schedules]([id]) ON DELETE CASCADE
    );
END
