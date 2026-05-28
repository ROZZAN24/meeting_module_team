-- =====================================================
-- V5.8 Create QMS Meeting Schedule Tables
-- Supports Meeting Schedule Management (5509)
-- =====================================================

-- 1. MEETING SCHEDULE MASTER
CREATE TABLE qms_meeting_schedule (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    schedule_no NVARCHAR(100) NOT NULL UNIQUE,
    rev_source_schedule_no NVARCHAR(100),
    rev_no INT DEFAULT 0,
    meeting_type_id INT NOT NULL, -- FK to qms_meeting_master (which is INT)
    meeting_name NVARCHAR(255),
    description NVARCHAR(MAX),
    agenda NVARCHAR(MAX),
    subject NVARCHAR(MAX),
    
    -- Vendor/Customer Linkage (CRM/SRM)
    customer_code NVARCHAR(100),
    supplier_code NVARCHAR(100),
    
    meeting_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    interval_time TIME,
    
    frequency NVARCHAR(50) DEFAULT 'NONE', -- NONE, DAILY, WEEKLY, etc.
    weekdays NVARCHAR(100), -- Comma separated days for WEEKLY
    
    chaired_by_id BIGINT, -- FK to hrm_employee_master (BIGINT)
    host_by_id BIGINT, -- FK to hrm_employee_master (BIGINT)
    
    cancel_reason NVARCHAR(255),
    reschedule_reason NVARCHAR(255),
    comments NVARCHAR(MAX),
    
    status NVARCHAR(20) DEFAULT 'OPEN', -- OPEN, CLOSED, AUTO CLOSED, RESCHEDULE
    
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    created_by NVARCHAR(100),
    updated_by NVARCHAR(100),
    
    CONSTRAINT FK_schedule_meeting_type FOREIGN KEY (meeting_type_id) REFERENCES qms_meeting_master(id)
);

-- 2. MEETING SCHEDULE DEPARTMENTS (Multi-select)
CREATE TABLE qms_meeting_schedule_department (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    schedule_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    CONSTRAINT FK_qmsms_dept_schedule FOREIGN KEY (schedule_id) REFERENCES qms_meeting_schedule(id) ON DELETE CASCADE,
    CONSTRAINT FK_qmsms_dept_master FOREIGN KEY (department_id) REFERENCES hrm_department_master(id)
);

-- 3. MEETING SCHEDULE PARTICIPANTS (Multi-select)
CREATE TABLE qms_meeting_schedule_participant (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    schedule_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    CONSTRAINT FK_qmsms_part_schedule FOREIGN KEY (schedule_id) REFERENCES qms_meeting_schedule(id) ON DELETE CASCADE,
    CONSTRAINT FK_qmsms_part_master FOREIGN KEY (employee_id) REFERENCES hrm_employee_master(id)
);
