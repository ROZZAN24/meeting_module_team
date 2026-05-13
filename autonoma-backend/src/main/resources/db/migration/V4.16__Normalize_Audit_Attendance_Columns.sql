-- V4.16 Normalize Audit Attendance Columns to match Model
-- Resolves 500 Error in AuditAttendanceController

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND type in (N'U'))
BEGIN
    -- 1. Add new columns if they don't exist
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'audit_schedule_no')
        ALTER TABLE [dbo].[audit_attendance] ADD [audit_schedule_no] NVARCHAR(50);

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'name')
        ALTER TABLE [dbo].[audit_attendance] ADD [name] NVARCHAR(255);

    -- 2. Migrate data using dynamic SQL to avoid parsing errors if columns are already gone
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'scheduleNo')
        EXEC sp_executesql N'UPDATE [dbo].[audit_attendance] SET [audit_schedule_no] = [scheduleNo] WHERE [audit_schedule_no] IS NULL AND [scheduleNo] IS NOT NULL';

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'employeeName')
        EXEC sp_executesql N'UPDATE [dbo].[audit_attendance] SET [name] = [employeeName] WHERE [name] IS NULL AND [employeeName] IS NOT NULL';

    -- 3. Drop old columns if they exist
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'scheduleNo')
        ALTER TABLE [dbo].[audit_attendance] DROP COLUMN [scheduleNo];

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'employeeName')
        ALTER TABLE [dbo].[audit_attendance] DROP COLUMN [employeeName];
        
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'employeeId')
        ALTER TABLE [dbo].[audit_attendance] DROP COLUMN [employeeId];
END
