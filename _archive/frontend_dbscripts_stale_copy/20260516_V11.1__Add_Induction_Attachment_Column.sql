-- Fix missing induction_attachment column if it was missed in V11.0
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('hr_induction_master') 
    AND name = 'induction_attachment'
)
BEGIN
    ALTER TABLE hr_induction_master
    ADD induction_attachment NVARCHAR(MAX);
END
GO
