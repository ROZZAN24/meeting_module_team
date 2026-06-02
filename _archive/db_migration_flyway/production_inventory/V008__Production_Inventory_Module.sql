-- V008__Production_Inventory_Module.sql
-- Phase 8: Production & Inventory (NPD Master) Module Schema Standardization
-- Renames and normalizes columns, default constraints, primary keys, and foreign keys of all 9 NPD tables to UPPERCASE snake_case and standardized types

-- ==========================================================
-- 0. Dynamic Foreign Key Drop to prevent dependency locks
-- ==========================================================
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) + 
               ' DROP CONSTRAINT ' + QUOTENAME(name) + ';' + CHAR(13) + CHAR(10)
FROM sys.foreign_keys
WHERE OBJECT_NAME(referenced_object_id) LIKE 'npd_%'
   OR OBJECT_NAME(referenced_object_id) LIKE 'NPD_%'
   OR OBJECT_NAME(parent_object_id) LIKE 'npd_%'
   OR OBJECT_NAME(parent_object_id) LIKE 'NPD_%';
IF @sql <> N''
BEGIN
    EXEC sp_executesql @sql;
END
GO

-- ==========================================================
-- 1. Helper Stored Procedure for Case-Sensitive Column Renames
-- ==========================================================
IF OBJECT_ID('dbo.sp_RenameColumnCS', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_RenameColumnCS;
GO

CREATE PROCEDURE dbo.sp_RenameColumnCS
    @tableName NVARCHAR(256),
    @oldCol NVARCHAR(256),
    @newCol NVARCHAR(256)
AS
BEGIN
    IF OBJECT_ID(@tableName, 'U') IS NOT NULL
    BEGIN
        -- Check if BOTH columns exist (can happen if Hibernate pre-creates the new column name)
        IF COL_LENGTH(@tableName, @oldCol) IS NOT NULL AND COL_LENGTH(@tableName, @newCol) IS NOT NULL
        BEGIN
            DECLARE @oldRealName NVARCHAR(256) = (SELECT name FROM sys.columns WHERE object_id = OBJECT_ID(@tableName) AND name = @oldCol);
            DECLARE @newRealName NVARCHAR(256) = (SELECT name FROM sys.columns WHERE object_id = OBJECT_ID(@tableName) AND name = @newCol);
            
            IF @oldRealName IS NOT NULL AND @newRealName IS NOT NULL AND LOWER(@oldRealName) <> LOWER(@newRealName)
            BEGIN
                -- Merge data from old column to new column
                DECLARE @sqlMerge NVARCHAR(MAX) = 'UPDATE ' + QUOTENAME(@tableName) + ' SET ' + QUOTENAME(@newRealName) + ' = ' + QUOTENAME(@oldRealName) + ' WHERE ' + QUOTENAME(@newRealName) + ' IS NULL';
                EXEC sp_executesql @sqlMerge;
                
                -- Drop default constraint if any exists on the old column
                DECLARE @dropDefault NVARCHAR(MAX) = N'';
                SELECT @dropDefault += N'ALTER TABLE ' + QUOTENAME(@tableName) + ' DROP CONSTRAINT ' + QUOTENAME(d.name) + ';' + CHAR(13) + CHAR(10)
                FROM sys.default_constraints d
                INNER JOIN sys.columns c ON d.parent_column_id = c.column_id AND d.parent_object_id = c.object_id
                WHERE d.parent_object_id = OBJECT_ID(@tableName) AND c.name = @oldRealName;
                IF @dropDefault <> N'' EXEC sp_executesql @dropDefault;

                -- Drop the old duplicate column
                DECLARE @sqlDrop NVARCHAR(MAX) = 'ALTER TABLE ' + QUOTENAME(@tableName) + ' DROP COLUMN ' + QUOTENAME(@oldRealName);
                EXEC sp_executesql @sqlDrop;
                RETURN;
            END
        END

        -- Normal case-sensitive rename flow
        IF COL_LENGTH(@tableName, @oldCol) IS NOT NULL
        BEGIN
            IF (SELECT name FROM sys.columns WHERE object_id = OBJECT_ID(@tableName) AND name = @oldCol) COLLATE Latin1_General_CS_AS <> @newCol
            BEGIN
                DECLARE @oldFull NVARCHAR(600) = @tableName + '.' + @oldCol;
                DECLARE @tempCol NVARCHAR(300) = @oldCol + '_TEMP';
                EXEC sp_rename @oldFull, @tempCol, 'COLUMN';
                DECLARE @tempFull NVARCHAR(600) = @tableName + '.' + @tempCol;
                EXEC sp_rename @tempFull, @newCol, 'COLUMN';
            END
        END
    END
END;
GO

-- ==========================================================
-- 2. Drop Default, Unique, Index and Primary Key constraints dynamically
-- ==========================================================
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'ALTER TABLE ' + QUOTENAME(t.name) + ' DROP CONSTRAINT ' + QUOTENAME(d.name) + ';' + CHAR(13) + CHAR(10)
FROM sys.default_constraints d
INNER JOIN sys.tables t ON d.parent_object_id = t.object_id
WHERE t.name LIKE 'npd_%' OR t.name LIKE 'NPD_%';
IF @sql <> N'' EXEC sp_executesql @sql;
GO

DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'ALTER TABLE ' + QUOTENAME(t.name) + ' DROP CONSTRAINT ' + QUOTENAME(tc.name) + ';' + CHAR(13) + CHAR(10)
FROM sys.key_constraints tc
INNER JOIN sys.tables t ON tc.parent_object_id = t.object_id
WHERE (t.name LIKE 'npd_%' OR t.name LIKE 'NPD_%') AND tc.type IN ('UQ', 'PK');
IF @sql <> N'' EXEC sp_executesql @sql;
GO

DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'DROP INDEX ' + QUOTENAME(i.name) + ' ON ' + QUOTENAME(t.name) + ';' + CHAR(13) + CHAR(10)
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
WHERE (t.name LIKE 'npd_%' OR t.name LIKE 'NPD_%')
  AND i.is_unique = 1 AND i.is_primary_key = 0 AND i.is_unique_constraint = 0;
IF @sql <> N'' EXEC sp_executesql @sql;
GO

-- ==========================================================
-- 3. NPD_ITEM_GROUP Casing and Alterations
-- ==========================================================
IF OBJECT_ID('NPD_ITEM_GROUP', 'U') IS NOT NULL
BEGIN
    -- Handle duplicate created_at / CREATED_DATE
    IF COL_LENGTH('NPD_ITEM_GROUP', 'created_at') IS NOT NULL AND COL_LENGTH('NPD_ITEM_GROUP', 'created_date') IS NOT NULL
        ALTER TABLE NPD_ITEM_GROUP DROP COLUMN created_at;
    IF COL_LENGTH('NPD_ITEM_GROUP', 'updated_at') IS NOT NULL AND COL_LENGTH('NPD_ITEM_GROUP', 'updated_date') IS NOT NULL
        ALTER TABLE NPD_ITEM_GROUP DROP COLUMN updated_at;

    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_GROUP', 'group_name', 'GROUP_NAME';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_GROUP', 'description', 'DESCRIPTION';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_GROUP', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_GROUP', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_GROUP', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('NPD_ITEM_GROUP', 'created_at') IS NOT NULL AND COL_LENGTH('NPD_ITEM_GROUP', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'NPD_ITEM_GROUP.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('NPD_ITEM_GROUP', 'updated_at') IS NOT NULL AND COL_LENGTH('NPD_ITEM_GROUP', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'NPD_ITEM_GROUP.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE NPD_ITEM_GROUP ALTER COLUMN GROUP_NAME NVARCHAR(100) NOT NULL;
    ALTER TABLE NPD_ITEM_GROUP ALTER COLUMN DESCRIPTION NVARCHAR(MAX);
    ALTER TABLE NPD_ITEM_GROUP ALTER COLUMN STATUS NVARCHAR(20) NOT NULL;
    ALTER TABLE NPD_ITEM_GROUP ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE NPD_ITEM_GROUP ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('NPD_ITEM_GROUP', 'IS_ACTIVE') IS NULL
        ALTER TABLE NPD_ITEM_GROUP ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 4. NPD_ITEM_TYPE Casing and Alterations
-- ==========================================================
IF OBJECT_ID('NPD_ITEM_TYPE', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('NPD_ITEM_TYPE', 'created_at') IS NOT NULL AND COL_LENGTH('NPD_ITEM_TYPE', 'created_date') IS NOT NULL
        ALTER TABLE NPD_ITEM_TYPE DROP COLUMN created_at;
    IF COL_LENGTH('NPD_ITEM_TYPE', 'updated_at') IS NOT NULL AND COL_LENGTH('NPD_ITEM_TYPE', 'updated_date') IS NOT NULL
        ALTER TABLE NPD_ITEM_TYPE DROP COLUMN updated_at;

    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_TYPE', 'group_id', 'GROUP_ID';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_TYPE', 'item_type', 'ITEM_TYPE';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_TYPE', 'group_prefix', 'GROUP_PREFIX';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_TYPE', 'item_prefix', 'ITEM_PREFIX';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_TYPE', 'is_auto_generate_code', 'IS_AUTO_GENERATE_CODE';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_TYPE', 'prefix_based', 'PREFIX_BASED';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_TYPE', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_TYPE', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_TYPE', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('NPD_ITEM_TYPE', 'created_at') IS NOT NULL AND COL_LENGTH('NPD_ITEM_TYPE', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'NPD_ITEM_TYPE.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('NPD_ITEM_TYPE', 'updated_at') IS NOT NULL AND COL_LENGTH('NPD_ITEM_TYPE', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'NPD_ITEM_TYPE.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE NPD_ITEM_TYPE ALTER COLUMN GROUP_ID BIGINT NOT NULL;
    ALTER TABLE NPD_ITEM_TYPE ALTER COLUMN ITEM_TYPE NVARCHAR(100) NOT NULL;
    ALTER TABLE NPD_ITEM_TYPE ALTER COLUMN GROUP_PREFIX NVARCHAR(50);
    ALTER TABLE NPD_ITEM_TYPE ALTER COLUMN ITEM_PREFIX NVARCHAR(50);
    ALTER TABLE NPD_ITEM_TYPE ALTER COLUMN IS_AUTO_GENERATE_CODE NVARCHAR(10) NOT NULL;
    ALTER TABLE NPD_ITEM_TYPE ALTER COLUMN PREFIX_BASED NVARCHAR(20) NOT NULL;
    ALTER TABLE NPD_ITEM_TYPE ALTER COLUMN STATUS NVARCHAR(20) NOT NULL;
    ALTER TABLE NPD_ITEM_TYPE ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE NPD_ITEM_TYPE ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('NPD_ITEM_TYPE', 'IS_ACTIVE') IS NULL
        ALTER TABLE NPD_ITEM_TYPE ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 5. NPD_ITEM_SUBTYPE Casing and Alterations
-- ==========================================================
IF OBJECT_ID('NPD_ITEM_SUBTYPE', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('NPD_ITEM_SUBTYPE', 'created_at') IS NOT NULL AND COL_LENGTH('NPD_ITEM_SUBTYPE', 'created_date') IS NOT NULL
        ALTER TABLE NPD_ITEM_SUBTYPE DROP COLUMN created_at;
    IF COL_LENGTH('NPD_ITEM_SUBTYPE', 'updated_at') IS NOT NULL AND COL_LENGTH('NPD_ITEM_SUBTYPE', 'updated_date') IS NOT NULL
        ALTER TABLE NPD_ITEM_SUBTYPE DROP COLUMN updated_at;

    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_SUBTYPE', 'type_id', 'TYPE_ID';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_SUBTYPE', 'sub_type', 'SUB_TYPE';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_SUBTYPE', 'sub_item_prefix', 'SUB_ITEM_PREFIX';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_SUBTYPE', 'is_auto_generate_code', 'IS_AUTO_GENERATE_CODE';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_SUBTYPE', 'prefix_based', 'PREFIX_BASED';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_SUBTYPE', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_SUBTYPE', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'NPD_ITEM_SUBTYPE', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('NPD_ITEM_SUBTYPE', 'created_at') IS NOT NULL AND COL_LENGTH('NPD_ITEM_SUBTYPE', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'NPD_ITEM_SUBTYPE.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('NPD_ITEM_SUBTYPE', 'updated_at') IS NOT NULL AND COL_LENGTH('NPD_ITEM_SUBTYPE', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'NPD_ITEM_SUBTYPE.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE NPD_ITEM_SUBTYPE ALTER COLUMN TYPE_ID BIGINT NOT NULL;
    ALTER TABLE NPD_ITEM_SUBTYPE ALTER COLUMN SUB_TYPE NVARCHAR(100) NOT NULL;
    ALTER TABLE NPD_ITEM_SUBTYPE ALTER COLUMN SUB_ITEM_PREFIX NVARCHAR(50);
    ALTER TABLE NPD_ITEM_SUBTYPE ALTER COLUMN IS_AUTO_GENERATE_CODE NVARCHAR(10) NOT NULL;
    ALTER TABLE NPD_ITEM_SUBTYPE ALTER COLUMN PREFIX_BASED NVARCHAR(20) NOT NULL;
    ALTER TABLE NPD_ITEM_SUBTYPE ALTER COLUMN STATUS NVARCHAR(20) NOT NULL;
    ALTER TABLE NPD_ITEM_SUBTYPE ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE NPD_ITEM_SUBTYPE ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('NPD_ITEM_SUBTYPE', 'IS_ACTIVE') IS NULL
        ALTER TABLE NPD_ITEM_SUBTYPE ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 6. NPD_OEM Casing and Alterations
-- ==========================================================
IF OBJECT_ID('NPD_OEM', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('NPD_OEM', 'created_at') IS NOT NULL AND COL_LENGTH('NPD_OEM', 'created_date') IS NOT NULL
        ALTER TABLE NPD_OEM DROP COLUMN created_at;
    IF COL_LENGTH('NPD_OEM', 'updated_at') IS NOT NULL AND COL_LENGTH('NPD_OEM', 'updated_date') IS NOT NULL
        ALTER TABLE NPD_OEM DROP COLUMN updated_at;

    EXEC dbo.sp_RenameColumnCS 'NPD_OEM', 'oem_short_name', 'OEM_SHORT_NAME';
    EXEC dbo.sp_RenameColumnCS 'NPD_OEM', 'oem_prefix', 'OEM_PREFIX';
    EXEC dbo.sp_RenameColumnCS 'NPD_OEM', 'oem_description', 'OEM_DESCRIPTION';
    EXEC dbo.sp_RenameColumnCS 'NPD_OEM', 'origin_country', 'ORIGIN_COUNTRY';
    EXEC dbo.sp_RenameColumnCS 'NPD_OEM', 'status_year', 'STATUS_YEAR';
    EXEC dbo.sp_RenameColumnCS 'NPD_OEM', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'NPD_OEM', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'NPD_OEM', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('NPD_OEM', 'created_at') IS NOT NULL AND COL_LENGTH('NPD_OEM', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'NPD_OEM.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('NPD_OEM', 'updated_at') IS NOT NULL AND COL_LENGTH('NPD_OEM', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'NPD_OEM.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE NPD_OEM ALTER COLUMN OEM_SHORT_NAME NVARCHAR(100) NOT NULL;
    ALTER TABLE NPD_OEM ALTER COLUMN OEM_PREFIX NVARCHAR(50);
    ALTER TABLE NPD_OEM ALTER COLUMN OEM_DESCRIPTION NVARCHAR(MAX);
    ALTER TABLE NPD_OEM ALTER COLUMN ORIGIN_COUNTRY NVARCHAR(100);
    ALTER TABLE NPD_OEM ALTER COLUMN STATUS_YEAR NVARCHAR(100);
    ALTER TABLE NPD_OEM ALTER COLUMN STATUS NVARCHAR(20) NOT NULL;
    ALTER TABLE NPD_OEM ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE NPD_OEM ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('NPD_OEM', 'IS_ACTIVE') IS NULL
        ALTER TABLE NPD_OEM ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 7. NPD_MODEL Casing and Alterations
-- ==========================================================
IF OBJECT_ID('NPD_MODEL', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('NPD_MODEL', 'created_at') IS NOT NULL AND COL_LENGTH('NPD_MODEL', 'created_date') IS NOT NULL
        ALTER TABLE NPD_MODEL DROP COLUMN created_at;
    IF COL_LENGTH('NPD_MODEL', 'updated_at') IS NOT NULL AND COL_LENGTH('NPD_MODEL', 'updated_date') IS NOT NULL
        ALTER TABLE NPD_MODEL DROP COLUMN updated_at;

    EXEC dbo.sp_RenameColumnCS 'NPD_MODEL', 'oem_id', 'OEM_ID';
    EXEC dbo.sp_RenameColumnCS 'NPD_MODEL', 'model_no', 'MODEL_NO';
    EXEC dbo.sp_RenameColumnCS 'NPD_MODEL', 'rotor_diameter', 'ROTOR_DIAMETER';
    EXEC dbo.sp_RenameColumnCS 'NPD_MODEL', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'NPD_MODEL', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'NPD_MODEL', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('NPD_MODEL', 'created_at') IS NOT NULL AND COL_LENGTH('NPD_MODEL', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'NPD_MODEL.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('NPD_MODEL', 'updated_at') IS NOT NULL AND COL_LENGTH('NPD_MODEL', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'NPD_MODEL.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE NPD_MODEL ALTER COLUMN OEM_ID BIGINT NOT NULL;
    ALTER TABLE NPD_MODEL ALTER COLUMN MODEL_NO NVARCHAR(100) NOT NULL;
    ALTER TABLE NPD_MODEL ALTER COLUMN ROTOR_DIAMETER DOUBLE PRECISION NOT NULL;
    ALTER TABLE NPD_MODEL ALTER COLUMN STATUS NVARCHAR(20) NOT NULL;
    ALTER TABLE NPD_MODEL ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE NPD_MODEL ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('NPD_MODEL', 'IS_ACTIVE') IS NULL
        ALTER TABLE NPD_MODEL ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 8. NPD_CAPACITY Casing and Alterations
-- ==========================================================
IF OBJECT_ID('NPD_CAPACITY', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('NPD_CAPACITY', 'created_at') IS NOT NULL AND COL_LENGTH('NPD_CAPACITY', 'created_date') IS NOT NULL
        ALTER TABLE NPD_CAPACITY DROP COLUMN created_at;
    IF COL_LENGTH('NPD_CAPACITY', 'updated_at') IS NOT NULL AND COL_LENGTH('NPD_CAPACITY', 'updated_date') IS NOT NULL
        ALTER TABLE NPD_CAPACITY DROP COLUMN updated_at;

    EXEC dbo.sp_RenameColumnCS 'NPD_CAPACITY', 'model_id', 'MODEL_ID';
    EXEC dbo.sp_RenameColumnCS 'NPD_CAPACITY', 'uom', 'UOM';
    EXEC dbo.sp_RenameColumnCS 'NPD_CAPACITY', 'capacity_val', 'CAPACITY_VAL';
    EXEC dbo.sp_RenameColumnCS 'NPD_CAPACITY', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'NPD_CAPACITY', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('NPD_CAPACITY', 'created_at') IS NOT NULL AND COL_LENGTH('NPD_CAPACITY', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'NPD_CAPACITY.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('NPD_CAPACITY', 'updated_at') IS NOT NULL AND COL_LENGTH('NPD_CAPACITY', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'NPD_CAPACITY.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE NPD_CAPACITY ALTER COLUMN MODEL_ID BIGINT NOT NULL;
    ALTER TABLE NPD_CAPACITY ALTER COLUMN UOM NVARCHAR(20) NOT NULL;
    ALTER TABLE NPD_CAPACITY ALTER COLUMN CAPACITY_VAL DOUBLE PRECISION NOT NULL;
    ALTER TABLE NPD_CAPACITY ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE NPD_CAPACITY ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('NPD_CAPACITY', 'IS_ACTIVE') IS NULL
        ALTER TABLE NPD_CAPACITY ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 9. NPD_OEM_MAPPING Casing and Alterations
-- ==========================================================
IF OBJECT_ID('NPD_OEM_MAPPING', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('NPD_OEM_MAPPING', 'created_at') IS NOT NULL AND COL_LENGTH('NPD_OEM_MAPPING', 'created_date') IS NOT NULL
        ALTER TABLE NPD_OEM_MAPPING DROP COLUMN created_at;
    IF COL_LENGTH('NPD_OEM_MAPPING', 'updated_at') IS NOT NULL AND COL_LENGTH('NPD_OEM_MAPPING', 'updated_date') IS NOT NULL
        ALTER TABLE NPD_OEM_MAPPING DROP COLUMN updated_at;

    EXEC dbo.sp_RenameColumnCS 'NPD_OEM_MAPPING', 'part_no', 'PART_NO';
    EXEC dbo.sp_RenameColumnCS 'NPD_OEM_MAPPING', 'oem_part_no', 'OEM_PART_NO';
    EXEC dbo.sp_RenameColumnCS 'NPD_OEM_MAPPING', 'oem_description', 'OEM_DESCRIPTION';
    EXEC dbo.sp_RenameColumnCS 'NPD_OEM_MAPPING', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'NPD_OEM_MAPPING', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'NPD_OEM_MAPPING', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('NPD_OEM_MAPPING', 'created_at') IS NOT NULL AND COL_LENGTH('NPD_OEM_MAPPING', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'NPD_OEM_MAPPING.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('NPD_OEM_MAPPING', 'updated_at') IS NOT NULL AND COL_LENGTH('NPD_OEM_MAPPING', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'NPD_OEM_MAPPING.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE NPD_OEM_MAPPING ALTER COLUMN PART_NO NVARCHAR(100) NOT NULL;
    ALTER TABLE NPD_OEM_MAPPING ALTER COLUMN OEM_PART_NO NVARCHAR(100) NOT NULL;
    ALTER TABLE NPD_OEM_MAPPING ALTER COLUMN OEM_DESCRIPTION NVARCHAR(MAX);
    ALTER TABLE NPD_OEM_MAPPING ALTER COLUMN STATUS NVARCHAR(20) NOT NULL;
    ALTER TABLE NPD_OEM_MAPPING ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE NPD_OEM_MAPPING ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('NPD_OEM_MAPPING', 'IS_ACTIVE') IS NULL
        ALTER TABLE NPD_OEM_MAPPING ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 10. NPD_PROCESS Casing and Alterations
-- ==========================================================
IF OBJECT_ID('NPD_PROCESS', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('NPD_PROCESS', 'created_at') IS NOT NULL AND COL_LENGTH('NPD_PROCESS', 'created_date') IS NOT NULL
        ALTER TABLE NPD_PROCESS DROP COLUMN created_at;
    IF COL_LENGTH('NPD_PROCESS', 'updated_at') IS NOT NULL AND COL_LENGTH('NPD_PROCESS', 'updated_date') IS NOT NULL
        ALTER TABLE NPD_PROCESS DROP COLUMN updated_at;

    EXEC dbo.sp_RenameColumnCS 'NPD_PROCESS', 'process_name', 'PROCESS_NAME';
    EXEC dbo.sp_RenameColumnCS 'NPD_PROCESS', 'description', 'DESCRIPTION';
    EXEC dbo.sp_RenameColumnCS 'NPD_PROCESS', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'NPD_PROCESS', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'NPD_PROCESS', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('NPD_PROCESS', 'created_at') IS NOT NULL AND COL_LENGTH('NPD_PROCESS', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'NPD_PROCESS.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('NPD_PROCESS', 'updated_at') IS NOT NULL AND COL_LENGTH('NPD_PROCESS', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'NPD_PROCESS.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE NPD_PROCESS ALTER COLUMN PROCESS_NAME NVARCHAR(150) NOT NULL;
    ALTER TABLE NPD_PROCESS ALTER COLUMN DESCRIPTION NVARCHAR(500);
    ALTER TABLE NPD_PROCESS ALTER COLUMN STATUS NVARCHAR(20) NOT NULL;
    ALTER TABLE NPD_PROCESS ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE NPD_PROCESS ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('NPD_PROCESS', 'IS_ACTIVE') IS NULL
        ALTER TABLE NPD_PROCESS ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 11. NPD_WIND_FARM Casing and Alterations
-- ==========================================================
IF OBJECT_ID('NPD_WIND_FARM', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('NPD_WIND_FARM', 'created_at') IS NOT NULL AND COL_LENGTH('NPD_WIND_FARM', 'created_date') IS NOT NULL
        ALTER TABLE NPD_WIND_FARM DROP COLUMN created_at;
    IF COL_LENGTH('NPD_WIND_FARM', 'updated_at') IS NOT NULL AND COL_LENGTH('NPD_WIND_FARM', 'updated_date') IS NOT NULL
        ALTER TABLE NPD_WIND_FARM DROP COLUMN updated_at;

    EXEC dbo.sp_RenameColumnCS 'NPD_WIND_FARM', 'wind_farm_name', 'WIND_FARM_NAME';
    EXEC dbo.sp_RenameColumnCS 'NPD_WIND_FARM', 'city', 'CITY';
    EXEC dbo.sp_RenameColumnCS 'NPD_WIND_FARM', 'state', 'STATE';
    EXEC dbo.sp_RenameColumnCS 'NPD_WIND_FARM', 'country', 'COUNTRY';
    EXEC dbo.sp_RenameColumnCS 'NPD_WIND_FARM', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'NPD_WIND_FARM', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('NPD_WIND_FARM', 'created_at') IS NOT NULL AND COL_LENGTH('NPD_WIND_FARM', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'NPD_WIND_FARM.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('NPD_WIND_FARM', 'updated_at') IS NOT NULL AND COL_LENGTH('NPD_WIND_FARM', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'NPD_WIND_FARM.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE NPD_WIND_FARM ALTER COLUMN WIND_FARM_NAME NVARCHAR(100) NOT NULL;
    ALTER TABLE NPD_WIND_FARM ALTER COLUMN CITY NVARCHAR(100) NOT NULL;
    ALTER TABLE NPD_WIND_FARM ALTER COLUMN STATE NVARCHAR(100) NOT NULL;
    ALTER TABLE NPD_WIND_FARM ALTER COLUMN COUNTRY NVARCHAR(100) NOT NULL;
    ALTER TABLE NPD_WIND_FARM ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE NPD_WIND_FARM ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('NPD_WIND_FARM', 'IS_ACTIVE') IS NULL
        ALTER TABLE NPD_WIND_FARM ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 12. Clean Primary Keys and Unique Constraints Re-creation
-- ==========================================================
ALTER TABLE NPD_ITEM_GROUP ADD CONSTRAINT PK_NPD_ITEM_GROUP PRIMARY KEY (id);
ALTER TABLE NPD_ITEM_GROUP ADD CONSTRAINT UQ_NPD_ITEM_GROUP_NAME UNIQUE (GROUP_NAME);

ALTER TABLE NPD_ITEM_TYPE ADD CONSTRAINT PK_NPD_ITEM_TYPE PRIMARY KEY (id);
ALTER TABLE NPD_ITEM_TYPE ADD CONSTRAINT UQ_NPD_ITEM_TYPE UNIQUE (GROUP_ID, ITEM_TYPE);

ALTER TABLE NPD_ITEM_SUBTYPE ADD CONSTRAINT PK_NPD_ITEM_SUBTYPE PRIMARY KEY (id);
ALTER TABLE NPD_ITEM_SUBTYPE ADD CONSTRAINT UQ_NPD_ITEM_SUBTYPE UNIQUE (TYPE_ID, SUB_TYPE);

ALTER TABLE NPD_OEM ADD CONSTRAINT PK_NPD_OEM PRIMARY KEY (id);
ALTER TABLE NPD_OEM ADD CONSTRAINT UQ_NPD_OEM_SHORT_NAME UNIQUE (OEM_SHORT_NAME);

ALTER TABLE NPD_MODEL ADD CONSTRAINT PK_NPD_MODEL PRIMARY KEY (id);
ALTER TABLE NPD_MODEL ADD CONSTRAINT UQ_NPD_MODEL_NO UNIQUE (MODEL_NO);

ALTER TABLE NPD_CAPACITY ADD CONSTRAINT PK_NPD_CAPACITY PRIMARY KEY (id);
ALTER TABLE NPD_CAPACITY ADD CONSTRAINT UQ_NPD_CAPACITY UNIQUE (MODEL_ID, UOM, CAPACITY_VAL);

ALTER TABLE NPD_OEM_MAPPING ADD CONSTRAINT PK_NPD_OEM_MAPPING PRIMARY KEY (id);
ALTER TABLE NPD_OEM_MAPPING ADD CONSTRAINT UQ_NPD_OEM_MAPPING_PART_NO UNIQUE (PART_NO);

ALTER TABLE NPD_PROCESS ADD CONSTRAINT PK_NPD_PROCESS PRIMARY KEY (id);
ALTER TABLE NPD_PROCESS ADD CONSTRAINT UQ_NPD_PROCESS_NAME UNIQUE (PROCESS_NAME);

ALTER TABLE NPD_WIND_FARM ADD CONSTRAINT PK_NPD_WIND_FARM PRIMARY KEY (id);
ALTER TABLE NPD_WIND_FARM ADD CONSTRAINT UQ_NPD_WIND_FARM_NAME UNIQUE (WIND_FARM_NAME);
GO

-- ==========================================================
-- 13. Re-establish clean foreign keys
-- ==========================================================
ALTER TABLE NPD_ITEM_TYPE ADD CONSTRAINT FK_NPD_ITEM_TYPE_GROUP FOREIGN KEY (GROUP_ID) REFERENCES NPD_ITEM_GROUP(id) ON DELETE CASCADE;
ALTER TABLE NPD_ITEM_SUBTYPE ADD CONSTRAINT FK_NPD_ITEM_SUBTYPE_TYPE FOREIGN KEY (TYPE_ID) REFERENCES NPD_ITEM_TYPE(id) ON DELETE CASCADE;
ALTER TABLE NPD_MODEL ADD CONSTRAINT FK_NPD_MODEL_OEM FOREIGN KEY (OEM_ID) REFERENCES NPD_OEM(id) ON DELETE CASCADE;
ALTER TABLE NPD_CAPACITY ADD CONSTRAINT FK_NPD_CAPACITY_MODEL FOREIGN KEY (MODEL_ID) REFERENCES NPD_MODEL(id) ON DELETE CASCADE;
GO
