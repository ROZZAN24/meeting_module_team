-- =============================================
-- V2.1 Seed HRM Lookups
-- Populates Categories, Levels, and Types
-- =============================================

-- 1. Create Tables if not exist (redundant if Hibernate creates them, but safe)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_CATEGORY_MASTER]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_CATEGORY_MASTER] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [category_name] NVARCHAR(100) NOT NULL UNIQUE
);
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_LEVEL_MASTER]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_LEVEL_MASTER] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [level_name] NVARCHAR(100) NOT NULL UNIQUE
);
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_TYPE_MASTER]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_TYPE_MASTER] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [type_name] NVARCHAR(100) NOT NULL UNIQUE
);
END

-- 2. Seed Data
INSERT INTO [dbo].[HRM_CATEGORY_MASTER] (category_name) 
SELECT 'OFFICE' WHERE NOT EXISTS (SELECT 1 FROM [dbo].[HRM_CATEGORY_MASTER] WHERE category_name = 'OFFICE');
INSERT INTO [dbo].[HRM_CATEGORY_MASTER] (category_name) 
SELECT 'SHOP FLOOR' WHERE NOT EXISTS (SELECT 1 FROM [dbo].[HRM_CATEGORY_MASTER] WHERE category_name = 'SHOP FLOOR');

INSERT INTO [dbo].[HRM_LEVEL_MASTER] (level_name) VALUES ('L1'),('L2'),('L3'),('L4'),('L5'),('L6'),('L7');

INSERT INTO [dbo].[HRM_TYPE_MASTER] (type_name) VALUES ('CONFIRMED'),('PROBATION'),('TRAINEE'),('CONTRACT');
