-- V4.3 Standardize All Tables Audit Columns
USE [AUTONOMA];

DECLARE @TableName NVARCHAR(255);
DECLARE @TableCursor CURSOR;

SET @TableCursor = CURSOR FOR
SELECT name FROM sys.tables WHERE name NOT LIKE 'flyway%';

OPEN @TableCursor;
FETCH NEXT FROM @TableCursor INTO @TableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE @FullColName NVARCHAR(500);

    -- RENAME LOGIC: Only rename if the target name DOES NOT exist yet.
    
    -- created_at
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'created_at')
    BEGIN
        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'createdDate')
        BEGIN
            SET @FullColName = @TableName + '.createdDate';
            EXEC sp_rename @FullColName, 'created_at', 'COLUMN';
        END
        ELSE IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'CREATED_DATE')
        BEGIN
            SET @FullColName = @TableName + '.CREATED_DATE';
            EXEC sp_rename @FullColName, 'created_at', 'COLUMN';
        END
        ELSE IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'created_date')
        BEGIN
            SET @FullColName = @TableName + '.created_date';
            EXEC sp_rename @FullColName, 'created_at', 'COLUMN';
        END
    END

    -- updated_at
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'updated_at')
    BEGIN
        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'updatedDate')
        BEGIN
            SET @FullColName = @TableName + '.updatedDate';
            EXEC sp_rename @FullColName, 'updated_at', 'COLUMN';
        END
        ELSE IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'UPDATED_DATE')
        BEGIN
            SET @FullColName = @TableName + '.UPDATED_DATE';
            EXEC sp_rename @FullColName, 'updated_at', 'COLUMN';
        END
        ELSE IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'updated_date')
        BEGIN
            SET @FullColName = @TableName + '.updated_date';
            EXEC sp_rename @FullColName, 'updated_at', 'COLUMN';
        END
    END

    -- created_by
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'created_by')
    BEGIN
        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'createdBy')
        BEGIN
            SET @FullColName = @TableName + '.createdBy';
            EXEC sp_rename @FullColName, 'created_by', 'COLUMN';
        END
        ELSE IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'CREATED_BY')
        BEGIN
            SET @FullColName = @TableName + '.CREATED_BY';
            EXEC sp_rename @FullColName, 'created_by', 'COLUMN';
        END
    END

    -- updated_by
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'updated_by')
    BEGIN
        IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'updatedBy')
        BEGIN
            SET @FullColName = @TableName + '.updatedBy';
            EXEC sp_rename @FullColName, 'updated_by', 'COLUMN';
        END
        ELSE IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'UPDATED_BY')
        BEGIN
            SET @FullColName = @TableName + '.UPDATED_BY';
            EXEC sp_rename @FullColName, 'updated_by', 'COLUMN';
        END
    END

    FETCH NEXT FROM @TableCursor INTO @TableName;
END;

CLOSE @TableCursor;
DEALLOCATE @TableCursor;
