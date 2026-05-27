-- =============================================
-- Author:      Autonoma ERP Team
-- Create date: 2026-05-27
-- Description: Add attachment_name and attachment_url columns to QMS_MEETING_MASTER.
--              The previous migration (20260525_V38.0) targeted the old lowercase table name
--              'qms_meeting_master' which was later renamed to 'QMS_MEETING_MASTER', so the
--              ALTER TABLE never ran against the correct table. This script fixes that.
-- =============================================

IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[QMS_MEETING_MASTER]')
      AND name = 'attachment_name'
)
BEGIN
    ALTER TABLE [dbo].[QMS_MEETING_MASTER] ADD [attachment_name] NVARCHAR(255) NULL;
END
GO

IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[QMS_MEETING_MASTER]')
      AND name = 'attachment_url'
)
BEGIN
    ALTER TABLE [dbo].[QMS_MEETING_MASTER] ADD [attachment_url] NVARCHAR(2000) NULL;
END
GO
