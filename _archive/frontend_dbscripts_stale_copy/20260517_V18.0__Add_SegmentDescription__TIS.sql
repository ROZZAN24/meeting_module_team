IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[sm_segment]') 
      AND name = 'segment_description'
)
BEGIN
    ALTER TABLE sm_segment ADD segment_description VARCHAR(1000);
END
GO
