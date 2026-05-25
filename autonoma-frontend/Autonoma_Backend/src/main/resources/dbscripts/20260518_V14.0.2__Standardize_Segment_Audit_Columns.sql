-- V14.0__Standardize_Segment_Audit_Columns.sql
-- Ensure sm_segment and sm_sub_segment have the required audit columns

DECLARE @TableName NVARCHAR(255);
DECLARE @TableCursor CURSOR;

SET @TableCursor = CURSOR FOR
SELECT name FROM sys.tables WHERE name IN ('sm_segment', 'sm_sub_segment');

OPEN @TableCursor;
FETCH NEXT FROM @TableCursor INTO @TableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Add created_by if missing
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'created_by')
    BEGIN
        EXEC('ALTER TABLE ' + @TableName + ' ADD created_by NVARCHAR(100)');
    END

    -- Add created_at if missing
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'created_at')
    BEGIN
        EXEC('ALTER TABLE ' + @TableName + ' ADD created_at DATETIME');
    END

    -- Add updated_by if missing
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'updated_by')
    BEGIN
        EXEC('ALTER TABLE ' + @TableName + ' ADD updated_by NVARCHAR(100)');
    END

    -- Add updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'updated_at')
    BEGIN
        EXEC('ALTER TABLE ' + @TableName + ' ADD updated_at DATETIME');
    END

    FETCH NEXT FROM @TableCursor INTO @TableName;
END;

CLOSE @TableCursor;
DEALLOCATE @TableCursor;
GO
