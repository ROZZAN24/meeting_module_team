-- V6.0: Create Meeting User Attendance table
-- Tracks self-service attendance for meeting participants
-- Each participant can only mark attendance once per schedule

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'qms_meeting_user_attendance')
BEGIN
    CREATE TABLE qms_meeting_user_attendance (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        schedule_id BIGINT NOT NULL,
        employee_id BIGINT NOT NULL,
        in_time TIME,
        out_time TIME,
        status VARCHAR(20) DEFAULT 'PRESENT',
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        created_by VARCHAR(100),
        updated_by VARCHAR(100),
        CONSTRAINT fk_mua_schedule FOREIGN KEY (schedule_id) REFERENCES qms_meeting_schedule(id),
        CONSTRAINT fk_mua_employee FOREIGN KEY (employee_id) REFERENCES hrm_employee_master(id),
        CONSTRAINT uq_mua_schedule_employee UNIQUE (schedule_id, employee_id)
    );
    PRINT 'Created qms_meeting_user_attendance table';
END;

-- Add actionTaken and actionObservation columns to mom_detail if not present
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('qms_mom_detail') AND name = 'action_taken')
BEGIN
    ALTER TABLE qms_mom_detail ADD action_taken NVARCHAR(MAX);
    PRINT 'Added action_taken to qms_mom_detail';
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('qms_mom_detail') AND name = 'action_observation')
BEGIN
    ALTER TABLE qms_mom_detail ADD action_observation NVARCHAR(MAX);
    PRINT 'Added action_observation to qms_mom_detail';
END;

-- Performance indexes for the meeting module
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('qms_meeting_user_attendance') AND name = 'idx_mua_schedule_id')
    CREATE INDEX idx_mua_schedule_id ON qms_meeting_user_attendance(schedule_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('qms_meeting_user_attendance') AND name = 'idx_mua_employee_id')
    CREATE INDEX idx_mua_employee_id ON qms_meeting_user_attendance(employee_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('qms_mom_detail') AND name = 'idx_mom_detail_status')
    CREATE INDEX idx_mom_detail_status ON qms_mom_detail(status);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('qms_meeting_schedule') AND name = 'idx_meeting_schedule_status')
    CREATE INDEX idx_meeting_schedule_status ON qms_meeting_schedule(status);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('qms_meeting_schedule') AND name = 'idx_meeting_schedule_date')
    CREATE INDEX idx_meeting_schedule_date ON qms_meeting_schedule(meeting_date);
