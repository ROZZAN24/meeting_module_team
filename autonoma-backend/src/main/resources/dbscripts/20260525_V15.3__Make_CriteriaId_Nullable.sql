IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'criteria_id' AND is_nullable = 0)
    ALTER TABLE hr_induction_training_detail ALTER COLUMN criteria_id BIGINT NULL
GO
