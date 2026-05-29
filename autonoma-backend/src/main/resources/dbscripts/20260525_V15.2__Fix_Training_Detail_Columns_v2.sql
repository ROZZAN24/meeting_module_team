IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'induction_master_id')
    ALTER TABLE hr_induction_training_detail ADD induction_master_id BIGINT
GO

UPDATE hr_induction_training_detail SET induction_master_id = criteria_id WHERE criteria_id IS NOT NULL AND induction_master_id IS NULL
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'trainer_status')
    ALTER TABLE hr_induction_training_detail ADD trainer_status NVARCHAR(50) DEFAULT 'PENDING'
GO

UPDATE hr_induction_training_detail SET trainer_status = current_status WHERE current_status IS NOT NULL AND trainer_status IS NULL
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'trainee_status')
    ALTER TABLE hr_induction_training_detail ADD trainee_status NVARCHAR(50)
GO

UPDATE hr_induction_training_detail SET trainee_status = trainee_response WHERE trainee_response IS NOT NULL AND trainee_status IS NULL
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'trainer_comments')
    ALTER TABLE hr_induction_training_detail ADD trainer_comments NVARCHAR(1000)
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hr_induction_training_detail') AND name = 'trainee_comments')
    ALTER TABLE hr_induction_training_detail ADD trainee_comments NVARCHAR(1000)
GO
