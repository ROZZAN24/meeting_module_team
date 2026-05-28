-- =============================================
-- Author:      Autonoma ERP Team
-- Create date: 2026-05-27
-- Description: Add missing columns to SM_SUB_SEGMENT.
--              The TIS database had SM_SUB_SEGMENT created via V7.0 (Sales_Marketing_Lookups__TIS)
--              which only created: id, SUB_SEGMENT_CODE, SUB_SEGMENT_NAME, STATUS.
--              V16.0__Add_Segment_Fields ran before the TIS DB existed (or against a different
--              table instance), so SEGMENT_NAME and SUB_SEGMENT_DESCRIPTION were never added.
--              The entity SubSegment.java maps both columns, causing JDBC errors.
-- =============================================

IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[SM_SUB_SEGMENT]')
      AND name = 'SEGMENT_NAME'
)
BEGIN
    ALTER TABLE [dbo].[SM_SUB_SEGMENT] ADD [SEGMENT_NAME] NVARCHAR(100) NULL;
END
GO

IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[SM_SUB_SEGMENT]')
      AND name = 'SUB_SEGMENT_DESCRIPTION'
)
BEGIN
    ALTER TABLE [dbo].[SM_SUB_SEGMENT] ADD [SUB_SEGMENT_DESCRIPTION] NVARCHAR(500) NULL;
END
GO

-- Also ensure audit columns exist (V8.6 used the old lowercase table name)
IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[SM_SUB_SEGMENT]')
      AND name = 'created_by'
)
BEGIN
    ALTER TABLE [dbo].[SM_SUB_SEGMENT] ADD [created_by] NVARCHAR(100) NULL;
END
GO

IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[SM_SUB_SEGMENT]')
      AND name = 'created_at'
)
BEGIN
    ALTER TABLE [dbo].[SM_SUB_SEGMENT] ADD [created_at] DATETIME NULL;
END
GO

IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[SM_SUB_SEGMENT]')
      AND name = 'updated_by'
)
BEGIN
    ALTER TABLE [dbo].[SM_SUB_SEGMENT] ADD [updated_by] NVARCHAR(100) NULL;
END
GO

IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[SM_SUB_SEGMENT]')
      AND name = 'updated_at'
)
BEGIN
    ALTER TABLE [dbo].[SM_SUB_SEGMENT] ADD [updated_at] DATETIME NULL;
END
GO
