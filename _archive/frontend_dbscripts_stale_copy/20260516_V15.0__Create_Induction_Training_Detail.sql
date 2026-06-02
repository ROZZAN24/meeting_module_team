-- 20260516_V15.0__Create_Induction_Training_Detail.sql
-- Granular tracking of induction training per criteria item

IF OBJECT_ID('hr_induction_training_detail', 'U') IS NULL
BEGIN
    CREATE TABLE hr_induction_training_detail (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        assignment_id BIGINT NOT NULL,
        criteria_id BIGINT NOT NULL,
        
        -- Trainer Results
        skill_rating INT DEFAULT 0, -- 1-5 scale
        trainer_comments NVARCHAR(MAX),
        is_trained BIT DEFAULT 0,
        
        -- Trainee Results
        trainee_response NVARCHAR(50), -- UNDERSTOOD, NEED MORE TRAINING
        trainee_comments NVARCHAR(MAX),
        
        -- Lifecycle Status
        current_status NVARCHAR(50) DEFAULT 'PENDING',
        attachment_path NVARCHAR(500),
        
        -- Audit Fields
        created_by NVARCHAR(100),
        created_at DATETIME DEFAULT GETDATE(),
        updated_by NVARCHAR(100),
        updated_at DATETIME,
        
        CONSTRAINT FK_InductionTraining_Assignment FOREIGN KEY (assignment_id) REFERENCES hr_induction_assignment(id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_InductionDetail_Assignment' AND object_id = OBJECT_ID('hr_induction_training_detail'))
BEGIN
    CREATE INDEX IX_InductionDetail_Assignment ON hr_induction_training_detail(assignment_id);
END
GO
