-- Add verified_by column to ticket_Tracability_center if it does not exist
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[ticket_Tracability_center]') 
      AND name = 'verified_by'
)
BEGIN
    ALTER TABLE ticket_Tracability_center ADD verified_by VARCHAR(100);
END
