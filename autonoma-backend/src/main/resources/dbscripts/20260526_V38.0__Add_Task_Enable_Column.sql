IF COL_LENGTH('dbo.bos_user_page_auth', 'add_task_enable') IS NULL
BEGIN
    ALTER TABLE dbo.bos_user_page_auth ADD add_task_enable BIT NOT NULL DEFAULT 0;
END
GO
