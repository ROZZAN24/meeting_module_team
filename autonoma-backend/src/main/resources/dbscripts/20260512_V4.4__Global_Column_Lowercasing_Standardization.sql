-- V4.4 Global Column Lowercasing Standardization
USE [AUTONOMA];

DECLARE @TableName NVARCHAR(255);
DECLARE @ColumnName NVARCHAR(255);
DECLARE @TableCursor CURSOR;

SET @TableCursor = CURSOR FOR
SELECT t.name, c.name
FROM sys.tables t
JOIN sys.columns c ON t.object_id = c.object_id
WHERE t.name NOT LIKE 'flyway%'
  AND c.name <> LOWER(c.name) COLLATE Latin1_General_CS_AS; -- Only if not already lowercase

OPEN @TableCursor;
FETCH NEXT FROM @TableCursor INTO @TableName, @ColumnName;

WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE @FullOldName NVARCHAR(500) = @TableName + '.' + @ColumnName;
    DECLARE @NewName NVARCHAR(500) = LOWER(@ColumnName);
    
    -- Check for potential collision (though rare in this ERP)
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = @NewName COLLATE Latin1_General_CS_AS)
    BEGIN
        EXEC sp_rename @FullOldName, @NewName, 'COLUMN';
    END
    
    FETCH NEXT FROM @TableCursor INTO @TableName, @ColumnName;
END;

CLOSE @TableCursor;
DEALLOCATE @TableCursor;
GO

-- Specific Fix for singularization consistency in QMS
IF OBJECT_ID('audit_criteria', 'U') IS NOT NULL AND OBJECT_ID('audit_criterion', 'U') IS NULL EXEC sp_rename 'audit_criteria', 'audit_criterion';
IF OBJECT_ID('audit_types', 'U') IS NOT NULL AND OBJECT_ID('audit_type', 'U') IS NULL EXEC sp_rename 'audit_types', 'audit_type';
IF OBJECT_ID('audit_areas', 'U') IS NOT NULL AND OBJECT_ID('audit_area', 'U') IS NULL EXEC sp_rename 'audit_areas', 'audit_area';
IF OBJECT_ID('audit_observations', 'U') IS NOT NULL AND OBJECT_ID('audit_observation', 'U') IS NULL EXEC sp_rename 'audit_observations', 'audit_observation';
IF OBJECT_ID('audit_schedules', 'U') IS NOT NULL AND OBJECT_ID('audit_schedule', 'U') IS NULL EXEC sp_rename 'audit_schedules', 'audit_schedule';
