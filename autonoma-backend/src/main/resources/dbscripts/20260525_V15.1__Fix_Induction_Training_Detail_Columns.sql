-- 20260525_V15.1__Fix_Induction_Training_Detail_Columns.sql
-- Fix column name mismatch between JPA entity and database table
-- JPA entity expects: induction_master_id, trainer_status, trainee_status
-- Original migration had: criteria_id, current_status/is_trained, trainee_response

-- 1. Add induction_master_id column (maps from criteria_id)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'induction_master_id')
BEGIN
    ALTER TABLE hr_induction_training_detail ADD induction_master_id BIGINT;
    -- Copy data from criteria_id to induction_master_id
    UPDATE hr_induction_training_detail SET induction_master_id = criteria_id WHERE criteria_id IS NOT NULL;
END
GO

-- 2. Add trainer_status column (maps from current_status)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'trainer_status')
BEGIN
    ALTER TABLE hr_induction_training_detail ADD trainer_status NVARCHAR(50) DEFAULT 'PENDING';
    -- Copy data from current_status to trainer_status
    UPDATE hr_induction_training_detail SET trainer_status = current_status WHERE current_status IS NOT NULL;
END
GO

-- 3. Add trainee_status column (maps from trainee_response)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'trainee_status')
BEGIN
    ALTER TABLE hr_induction_training_detail ADD trainee_status NVARCHAR(50);
    -- Copy data from trainee_response to trainee_status
    UPDATE hr_induction_training_detail SET trainee_status = trainee_response WHERE trainee_response IS NOT NULL;
END
GO

-- 4. Add trainer_comments column if missing (original had it but as NVARCHAR(MAX))
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'trainer_comments')
BEGIN
    ALTER TABLE hr_induction_training_detail ADD trainer_comments NVARCHAR(1000);
END
GO

-- 5. Add trainee_comments column if missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'trainee_comments')
BEGIN
    ALTER TABLE hr_induction_training_detail ADD trainee_comments NVARCHAR(1000);
END
GO
