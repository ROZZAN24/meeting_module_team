-- ============================================================
-- V41.0 Alter qms_checklist_master and qms_master_checklist:
--       Status columns -> INT
-- ============================================================
USE [AUTONOMA];
GO

-- Helper procedure to safely alter columns to INT
IF OBJECT_ID('dbo.sp_AlterChecklistStatusColumnsToInt', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_AlterChecklistStatusColumnsToInt;
GO

CREATE PROCEDURE dbo.sp_AlterChecklistStatusColumnsToInt
    @TableName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ObjectId INT = OBJECT_ID(@TableName);
    IF @ObjectId IS NULL
    BEGIN
        PRINT 'Table ' + @TableName + ' does not exist. Skipping.';
        RETURN;
    END

    DECLARE @sql NVARCHAR(MAX) = '';

    -- 1. Convert STATUS column
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectId AND name = 'STATUS' AND system_type_id IN (TYPE_ID('varchar'), TYPE_ID('nvarchar')))
    BEGIN
        PRINT 'Converting STATUS in ' + @TableName + ' to INT...';
        -- Add STATUS_INT
        IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectId AND name = 'STATUS_INT')
        BEGIN
            SET @sql = 'ALTER TABLE ' + QUOTENAME(@TableName) + ' ADD [STATUS_INT] INT NULL;';
            EXEC sp_executesql @sql;
        END

        -- Migrate data
        SET @sql = 'UPDATE ' + QUOTENAME(@TableName) + ' SET [STATUS_INT] = CASE 
            WHEN UPPER(LTRIM(RTRIM(CAST([STATUS] AS NVARCHAR(100))))) = ''ACTIVE'' THEN 1
            WHEN UPPER(LTRIM(RTRIM(CAST([STATUS] AS NVARCHAR(100))))) = ''EXPIRED'' THEN 2
            WHEN UPPER(LTRIM(RTRIM(CAST([STATUS] AS NVARCHAR(100))))) = ''PENDING'' THEN 3
            WHEN UPPER(LTRIM(RTRIM(CAST([STATUS] AS NVARCHAR(100))))) IN (''CANCELLED'', ''CANCELED'') THEN 4
            ELSE 0
        END WHERE [STATUS_INT] IS NULL;';
        EXEC sp_executesql @sql;

        -- Drop constraint if exists
        SET @sql = '';
        SELECT @sql += 'ALTER TABLE ' + QUOTENAME(@TableName) + ' DROP CONSTRAINT ' + QUOTENAME(dc.name) + ';'
        FROM sys.default_constraints dc
        JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
        WHERE dc.parent_object_id = @ObjectId AND c.name = 'STATUS';
        IF @sql <> '' EXEC sp_executesql @sql;

        -- Drop STATUS column
        SET @sql = 'ALTER TABLE ' + QUOTENAME(@TableName) + ' DROP COLUMN [STATUS];';
        EXEC sp_executesql @sql;

        -- Rename STATUS_INT -> STATUS
        DECLARE @RenameTarget NVARCHAR(250) = @TableName + '.STATUS_INT';
        EXEC sp_rename @RenameTarget, 'STATUS', 'COLUMN';
    END

    -- 2. Convert TASK_STATUS column
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectId AND name = 'TASK_STATUS' AND system_type_id IN (TYPE_ID('varchar'), TYPE_ID('nvarchar')))
    BEGIN
        PRINT 'Converting TASK_STATUS in ' + @TableName + ' to INT...';
        -- Add TASK_STATUS_INT
        IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectId AND name = 'TASK_STATUS_INT')
        BEGIN
            SET @sql = 'ALTER TABLE ' + QUOTENAME(@TableName) + ' ADD [TASK_STATUS_INT] INT NULL;';
            EXEC sp_executesql @sql;
        END

        -- Migrate data
        SET @sql = 'UPDATE ' + QUOTENAME(@TableName) + ' SET [TASK_STATUS_INT] = CASE 
            WHEN UPPER(LTRIM(RTRIM(CAST([TASK_STATUS] AS NVARCHAR(100))))) IN (''IN_PROGRESS'',''INPROGRESS'',''IN PROGRESS'') THEN 1
            WHEN UPPER(LTRIM(RTRIM(CAST([TASK_STATUS] AS NVARCHAR(100))))) IN (''COMPLETED'',''DONE'') THEN 2
            WHEN UPPER(LTRIM(RTRIM(CAST([TASK_STATUS] AS NVARCHAR(100))))) = ''OVERDUE'' THEN 3
            WHEN UPPER(LTRIM(RTRIM(CAST([TASK_STATUS] AS NVARCHAR(100))))) IN (''CANCELLED'',''CANCELED'') THEN 4
            ELSE 0
        END WHERE [TASK_STATUS_INT] IS NULL;';
        EXEC sp_executesql @sql;

        -- Drop constraint if exists
        SET @sql = '';
        SELECT @sql += 'ALTER TABLE ' + QUOTENAME(@TableName) + ' DROP CONSTRAINT ' + QUOTENAME(dc.name) + ';'
        FROM sys.default_constraints dc
        JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
        WHERE dc.parent_object_id = @ObjectId AND c.name = 'TASK_STATUS';
        IF @sql <> '' EXEC sp_executesql @sql;

        -- Drop TASK_STATUS column
        SET @sql = 'ALTER TABLE ' + QUOTENAME(@TableName) + ' DROP COLUMN [TASK_STATUS];';
        EXEC sp_executesql @sql;

        -- Rename TASK_STATUS_INT -> TASK_STATUS
        DECLARE @RenameTargetTask NVARCHAR(250) = @TableName + '.TASK_STATUS_INT';
        EXEC sp_rename @RenameTargetTask, 'TASK_STATUS', 'COLUMN';
    END

    -- 3. Convert VERIFY_STATUS column
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectId AND name = 'VERIFY_STATUS' AND system_type_id IN (TYPE_ID('varchar'), TYPE_ID('nvarchar')))
    BEGIN
        PRINT 'Converting VERIFY_STATUS in ' + @TableName + ' to INT...';
        -- Add VERIFY_STATUS_INT
        IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = @ObjectId AND name = 'VERIFY_STATUS_INT')
        BEGIN
            SET @sql = 'ALTER TABLE ' + QUOTENAME(@TableName) + ' ADD [VERIFY_STATUS_INT] INT NULL;';
            EXEC sp_executesql @sql;
        END

        -- Migrate data
        SET @sql = 'UPDATE ' + QUOTENAME(@TableName) + ' SET [VERIFY_STATUS_INT] = CASE 
            WHEN UPPER(LTRIM(RTRIM(CAST([VERIFY_STATUS] AS NVARCHAR(100))))) IN (''APPROVED'',''APPROVE'',''VERIFIED'') THEN 1
            WHEN UPPER(LTRIM(RTRIM(CAST([VERIFY_STATUS] AS NVARCHAR(100))))) IN (''REJECTED'',''REJECT'') THEN 2
            WHEN UPPER(LTRIM(RTRIM(CAST([VERIFY_STATUS] AS NVARCHAR(100))))) = ''HOLD'' THEN 3
            ELSE 0
        END WHERE [VERIFY_STATUS_INT] IS NULL;';
        EXEC sp_executesql @sql;

        -- Drop constraint if exists
        SET @sql = '';
        SELECT @sql += 'ALTER TABLE ' + QUOTENAME(@TableName) + ' DROP CONSTRAINT ' + QUOTENAME(dc.name) + ';'
        FROM sys.default_constraints dc
        JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
        WHERE dc.parent_object_id = @ObjectId AND c.name = 'VERIFY_STATUS';
        IF @sql <> '' EXEC sp_executesql @sql;

        -- Drop VERIFY_STATUS column
        SET @sql = 'ALTER TABLE ' + QUOTENAME(@TableName) + ' DROP COLUMN [VERIFY_STATUS];';
        EXEC sp_executesql @sql;

        -- Rename VERIFY_STATUS_INT -> VERIFY_STATUS
        DECLARE @RenameTargetVerify NVARCHAR(250) = @TableName + '.VERIFY_STATUS_INT';
        EXEC sp_rename @RenameTargetVerify, 'VERIFY_STATUS', 'COLUMN';
    END
END;
GO

-- Execute the procedure for both possible master table names
EXEC dbo.sp_AlterChecklistStatusColumnsToInt 'qms_checklist_master';
EXEC dbo.sp_AlterChecklistStatusColumnsToInt 'qms_master_checklist';
GO

-- Cleanup procedure
DROP PROCEDURE dbo.sp_AlterChecklistStatusColumnsToInt;
GO
