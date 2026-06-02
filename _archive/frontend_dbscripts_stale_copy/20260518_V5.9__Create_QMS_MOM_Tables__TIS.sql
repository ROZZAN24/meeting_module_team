-- =====================================================
-- V5.9 Create QMS Meeting Minutes (MOM) Tables
-- Supports Meeting Minutes Management (5511)
-- =====================================================

-- 1. MOM MASTER (Header)
CREATE TABLE qms_mom_master (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    mom_no NVARCHAR(100) NOT NULL UNIQUE,
    mom_date DATE NOT NULL DEFAULT GETDATE(),
    schedule_id BIGINT NOT NULL, -- FK to qms_meeting_schedule
    agenda NVARCHAR(MAX),
    chaired_by_id BIGINT,
    start_time TIME,
    end_time TIME,
    status NVARCHAR(50) DEFAULT 'OPEN',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    created_by NVARCHAR(100),
    updated_by NVARCHAR(100),
    
    CONSTRAINT FK_mom_schedule FOREIGN KEY (schedule_id) REFERENCES qms_meeting_schedule(id)
);

-- 2. MOM ATTENDANCE
CREATE TABLE qms_mom_attendance (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    mom_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    in_time TIME,
    out_time TIME,
    attendance_status NVARCHAR(20), -- Present / Absent
    
    CONSTRAINT FK_mom_att_master FOREIGN KEY (mom_id) REFERENCES qms_mom_master(id) ON DELETE CASCADE,
    CONSTRAINT FK_mom_att_emp FOREIGN KEY (employee_id) REFERENCES hrm_employee_master(id)
);

-- 3. MOM DETAILS (Discussion Points & Actions)
CREATE TABLE qms_mom_detail (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    mom_id BIGINT NOT NULL,
    discussed_point NVARCHAR(MAX) NOT NULL,
    point_type NVARCHAR(50), -- RM / PRODUCT / etc.
    process_type NVARCHAR(20), -- INFO / ACTION
    assigned_by_id BIGINT,
    assigned_to_id BIGINT,
    target_date DATE,
    review_date DATE,
    attachment_required NVARCHAR(5) DEFAULT 'NO',
    status NVARCHAR(50) DEFAULT 'OPEN', -- OPEN, CLOSED, CANCELLED, etc.
    cancel_remarks NVARCHAR(MAX),
    
    -- Amendment / Revision tracking
    rev_no INT DEFAULT 0,
    amendment_comments NVARCHAR(MAX),
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    created_by NVARCHAR(100),
    updated_by NVARCHAR(100),
    
    CONSTRAINT FK_mom_det_master FOREIGN KEY (mom_id) REFERENCES qms_mom_master(id) ON DELETE CASCADE,
    CONSTRAINT FK_mom_det_assign_by FOREIGN KEY (assigned_by_id) REFERENCES hrm_employee_master(id),
    CONSTRAINT FK_mom_det_assign_to FOREIGN KEY (assigned_to_id) REFERENCES hrm_employee_master(id)
);
