-- Emergency Repair for Department Status
USE [AUTONOMA];
GO

-- 1. Trim any accidental spaces and fix casing
UPDATE [dbo].[hrm_department_master]
SET [status] = 'Active'
WHERE LTRIM(RTRIM(UPPER([status]))) = 'ACTIVE';

-- 2. Verify we have active departments
SELECT [id], [dept_name], [status] 
FROM [dbo].[hrm_department_master] 
WHERE [status] = 'Active';
GO
