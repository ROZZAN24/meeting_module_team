IF OBJECT_ID(N'[dbo].[sm_segment]', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'[dbo].[sm_segment]') 
          AND name = 'segment_description'
    )
    BEGIN
        EXEC('ALTER TABLE sm_segment ADD segment_description VARCHAR(1000)');
    END
END
GO
