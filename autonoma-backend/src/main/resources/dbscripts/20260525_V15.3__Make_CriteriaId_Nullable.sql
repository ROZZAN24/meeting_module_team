-- 20260525_V15.3__Make_CriteriaId_Nullable.sql

IF OBJECT_ID('IND_INDUCTION_TRAINING_DETAIL', 'U') IS NOT NULL
BEGIN
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('IND_INDUCTION_TRAINING_DETAIL') AND name = 'criteria_id' AND is_nullable = 0)
    BEGIN
        ALTER TABLE IND_INDUCTION_TRAINING_DETAIL ALTER COLUMN criteria_id BIGINT NULL;
    END
END
ELSE IF OBJECT_ID('hr_induction_training_detail', 'U') IS NOT NULL
BEGIN
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'criteria_id' AND is_nullable = 0)
    BEGIN
        ALTER TABLE hr_induction_training_detail ALTER COLUMN criteria_id BIGINT NULL;
    END
END
GO
