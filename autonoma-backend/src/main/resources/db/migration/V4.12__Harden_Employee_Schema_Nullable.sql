-- V4.12 Harden Employee Schema - Make all columns nullable except ID
USE [AUTONOMA];
GO

-- 1. Identify all NOT NULL columns in hrm_employee_master (excluding ID)
DECLARE @sql NVARCHAR(MAX) = '';

SELECT @sql += 'ALTER TABLE hrm_employee_master ALTER COLUMN [' + c.name + '] ' + 
               tp.name + 
               CASE WHEN tp.name IN ('nvarchar', 'varchar', 'nchar', 'char') THEN '(' + 
                    CASE WHEN c.max_length = -1 THEN 'MAX' ELSE CAST(c.max_length / CASE WHEN tp.name LIKE 'n%' THEN 2 ELSE 1 END AS NVARCHAR(10)) END + ')' 
                    ELSE '' END + ' NULL; '
FROM sys.columns c
JOIN sys.types tp ON c.user_type_id = tp.user_type_id
WHERE c.object_id = OBJECT_ID('hrm_employee_master')
  AND c.is_nullable = 0
  AND c.is_identity = 0
  AND c.name <> 'id'
  AND NOT EXISTS (
      SELECT 1 FROM sys.index_columns ic 
      WHERE ic.object_id = c.object_id AND ic.column_id = c.column_id
  );

EXEC sp_executesql @sql;
GO
