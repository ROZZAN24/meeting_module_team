-- V3.4 Add Audit Schedule Min Count
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'criteriaMinCount')
BEGIN
    ALTER TABLE [dbo].[audit_schedules] ADD [criteriaMinCount] INT;
END
