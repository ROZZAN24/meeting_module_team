-- M054 Add employee_code to audit_attendance
-- Fixes 500 error that blocks the Audit Attendance page initialization

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND type in (N'U'))
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'employee_code')
    BEGIN
        ALTER TABLE [dbo].[audit_attendance] ADD [employee_code] NVARCHAR(50);
    END
END
GO
