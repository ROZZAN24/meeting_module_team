-- Alter Department Number to String to support professional codes like DEPT-001
-- Drop the default constraint first
DECLARE @ConstraintName nvarchar(200)
SELECT @ConstraintName = Name FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID('hrm_department_master') AND parent_column_id = (SELECT column_id FROM sys.columns WHERE parent_object_id = OBJECT_ID('hrm_department_master') AND name = 'dept_no')
IF @ConstraintName IS NOT NULL EXEC('ALTER TABLE hrm_department_master DROP CONSTRAINT ' + @ConstraintName)

ALTER TABLE hrm_department_master ALTER COLUMN dept_no NVARCHAR(50);
GO
