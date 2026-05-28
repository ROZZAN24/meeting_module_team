IF NOT EXISTS (
  SELECT * FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'ticket_Tracability_center' AND COLUMN_NAME = 'additional_requirement'
)
BEGIN
  ALTER TABLE ticket_Tracability_center ADD additional_requirement NVARCHAR(MAX);
END
