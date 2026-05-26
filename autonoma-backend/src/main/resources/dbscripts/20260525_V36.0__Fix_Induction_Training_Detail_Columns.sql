-- Fix hr_induction_training_detail columns to match JPA entity InductionTrainingDetail.java
-- The original migration V15.0 created columns that don't match the entity mappings.
-- This script renames/adds the correct columns.

-- 1. Rename criteria_id -> induction_master_id (entity maps @Column(name="induction_master_id"))
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='hr_induction_training_detail' AND COLUMN_NAME='criteria_id')
   AND NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='hr_induction_training_detail' AND COLUMN_NAME='induction_master_id')
BEGIN
    EXEC sp_rename 'hr_induction_training_detail.criteria_id', 'induction_master_id', 'COLUMN';
END
GO

-- 2. Add trainer_status column (entity maps @Column(name="trainer_status"))
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='hr_induction_training_detail' AND COLUMN_NAME='trainer_status')
BEGIN
    ALTER TABLE hr_induction_training_detail ADD trainer_status NVARCHAR(50) DEFAULT 'PENDING';
END
GO

-- 3. Add trainee_status column (entity maps @Column(name="trainee_status"))
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='hr_induction_training_detail' AND COLUMN_NAME='trainee_status')
BEGIN
    ALTER TABLE hr_induction_training_detail ADD trainee_status NVARCHAR(50);
END
GO

-- 4. Add trainee_comments column (entity maps @Column(name="trainee_comments"))
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='hr_induction_training_detail' AND COLUMN_NAME='trainee_comments')
BEGIN
    ALTER TABLE hr_induction_training_detail ADD trainee_comments NVARCHAR(1000);
END
GO

-- 5. Widen attachment_path to NVARCHAR(MAX) if it's NVARCHAR(500)
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='hr_induction_training_detail' AND COLUMN_NAME='attachment_path' AND CHARACTER_MAXIMUM_LENGTH=500)
BEGIN
    ALTER TABLE hr_induction_training_detail ALTER COLUMN attachment_path NVARCHAR(MAX);
END
GO

-- 6. Migrate data from old columns to new ones if old columns exist
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='hr_induction_training_detail' AND COLUMN_NAME='current_status')
BEGIN
    UPDATE hr_induction_training_detail SET trainer_status = current_status WHERE trainer_status IS NULL OR trainer_status = 'PENDING';
END
GO

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='hr_induction_training_detail' AND COLUMN_NAME='trainee_response')
BEGIN
    UPDATE hr_induction_training_detail SET trainee_status = trainee_response WHERE trainee_status IS NULL;
END
GO
