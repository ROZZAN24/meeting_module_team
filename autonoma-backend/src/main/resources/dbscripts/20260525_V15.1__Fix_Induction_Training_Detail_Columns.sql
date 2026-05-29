-- 20260525_V15.1__Fix_Induction_Training_Detail_Columns.sql
-- Fix column name mismatch between JPA entity and database table

-- 1. Add induction_master_id column (maps from criteria_id)
IF OBJECT_ID('IND_INDUCTION_TRAINING_DETAIL', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('IND_INDUCTION_TRAINING_DETAIL') AND name = 'induction_master_id')
    BEGIN
        ALTER TABLE IND_INDUCTION_TRAINING_DETAIL ADD induction_master_id BIGINT;
    END
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('IND_INDUCTION_TRAINING_DETAIL') AND name = 'criteria_id')
    BEGIN
        EXEC('UPDATE IND_INDUCTION_TRAINING_DETAIL SET induction_master_id = criteria_id WHERE criteria_id IS NOT NULL');
    END
END
ELSE IF OBJECT_ID('hr_induction_training_detail', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'induction_master_id')
    BEGIN
        ALTER TABLE hr_induction_training_detail ADD induction_master_id BIGINT;
    END
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'criteria_id')
    BEGIN
        EXEC('UPDATE hr_induction_training_detail SET induction_master_id = criteria_id WHERE criteria_id IS NOT NULL');
    END
END
GO

-- 2. Add trainer_status column (maps from current_status)
IF OBJECT_ID('IND_INDUCTION_TRAINING_DETAIL', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('IND_INDUCTION_TRAINING_DETAIL') AND name = 'trainer_status')
    BEGIN
        ALTER TABLE IND_INDUCTION_TRAINING_DETAIL ADD trainer_status NVARCHAR(50) DEFAULT 'PENDING';
    END
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('IND_INDUCTION_TRAINING_DETAIL') AND name = 'current_status')
    BEGIN
        EXEC('UPDATE IND_INDUCTION_TRAINING_DETAIL SET trainer_status = current_status WHERE current_status IS NOT NULL');
    END
END
ELSE IF OBJECT_ID('hr_induction_training_detail', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'trainer_status')
    BEGIN
        ALTER TABLE hr_induction_training_detail ADD trainer_status NVARCHAR(50) DEFAULT 'PENDING';
    END
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'current_status')
    BEGIN
        EXEC('UPDATE hr_induction_training_detail SET trainer_status = current_status WHERE current_status IS NOT NULL');
    END
END
GO

-- 3. Add trainee_status column (maps from trainee_response)
IF OBJECT_ID('IND_INDUCTION_TRAINING_DETAIL', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('IND_INDUCTION_TRAINING_DETAIL') AND name = 'trainee_status')
    BEGIN
        ALTER TABLE IND_INDUCTION_TRAINING_DETAIL ADD trainee_status NVARCHAR(50);
    END
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('IND_INDUCTION_TRAINING_DETAIL') AND name = 'trainee_response')
    BEGIN
        EXEC('UPDATE IND_INDUCTION_TRAINING_DETAIL SET trainee_status = trainee_response WHERE trainee_response IS NOT NULL');
    END
END
ELSE IF OBJECT_ID('hr_induction_training_detail', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'trainee_status')
    BEGIN
        ALTER TABLE hr_induction_training_detail ADD trainee_status NVARCHAR(50);
    END
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'trainee_response')
    BEGIN
        EXEC('UPDATE hr_induction_training_detail SET trainee_status = trainee_response WHERE trainee_response IS NOT NULL');
    END
END
GO

-- 4. Add trainer_comments column if missing
IF OBJECT_ID('IND_INDUCTION_TRAINING_DETAIL', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('IND_INDUCTION_TRAINING_DETAIL') AND name = 'trainer_comments')
    BEGIN
        ALTER TABLE IND_INDUCTION_TRAINING_DETAIL ADD trainer_comments NVARCHAR(1000);
    END
END
ELSE IF OBJECT_ID('hr_induction_training_detail', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'trainer_comments')
    BEGIN
        ALTER TABLE hr_induction_training_detail ADD trainer_comments NVARCHAR(1000);
    END
END
GO

-- 5. Add trainee_comments column if missing
IF OBJECT_ID('IND_INDUCTION_TRAINING_DETAIL', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('IND_INDUCTION_TRAINING_DETAIL') AND name = 'trainee_comments')
    BEGIN
        ALTER TABLE IND_INDUCTION_TRAINING_DETAIL ADD trainee_comments NVARCHAR(1000);
    END
END
ELSE IF OBJECT_ID('hr_induction_training_detail', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'trainee_comments')
    BEGIN
        ALTER TABLE hr_induction_training_detail ADD trainee_comments NVARCHAR(1000);
    END
END
GO
