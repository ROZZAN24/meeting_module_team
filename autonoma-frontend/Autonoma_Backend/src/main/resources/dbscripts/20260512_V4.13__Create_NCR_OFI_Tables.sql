-- NCR / OFI Management System - Database Schema
-- Based on SOP Step 27

-- 1. Main Table for NCR / OFI Master
CREATE TABLE ncr_ofi_master (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ncr_ofi_no NVARCHAR(50) UNIQUE NOT NULL, -- e.g., NCR/2026/0001
    observation_id INT NOT NULL, -- FK to audit_observation
    observation_detail_id INT NOT NULL, -- FK to audit_observation_details (specific finding)
    type NVARCHAR(10) NOT NULL, -- NCR or OFI
    observation_date DATE NOT NULL,
    target_date DATE NOT NULL,
    auditee_id INT NOT NULL, -- Responsible person
    ncr_approver_id INT NOT NULL, -- Final approver
    root_cause NVARCHAR(MAX),
    corrective_action NVARCHAR(MAX),
    status NVARCHAR(20) DEFAULT 'OPEN', -- OPEN, ACTION PENDING, UNDER REVIEW, APPROVED, CLOSED, REJECTED
    approval_status NVARCHAR(20) DEFAULT 'PENDING',
    created_by NVARCHAR(100),
    created_date DATETIME DEFAULT GETDATE(),
    updated_by NVARCHAR(100),
    updated_date DATETIME DEFAULT GETDATE()
);

-- 2. Corrective Action Timeline / History
CREATE TABLE ncr_ofi_actions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ncr_ofi_id INT NOT NULL,
    action_type NVARCHAR(50), -- CORRECTIVE, PREVENTIVE, ROOT_CAUSE
    action_description NVARCHAR(MAX),
    action_by INT,
    action_date DATE,
    completion_date DATE,
    remarks NVARCHAR(MAX),
    status NVARCHAR(20),
    created_date DATETIME DEFAULT GETDATE()
);

-- 3. Attachment Registry
CREATE TABLE ncr_ofi_attachments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ncr_ofi_id INT NOT NULL,
    file_name NVARCHAR(255),
    file_path NVARCHAR(MAX),
    file_type NVARCHAR(50), -- EVIDENCE, ROOT_CAUSE_DOC, etc.
    uploaded_by NVARCHAR(100),
    uploaded_date DATETIME DEFAULT GETDATE()
);

-- 4. Approval Workflow History
CREATE TABLE ncr_ofi_approval (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ncr_ofi_id INT NOT NULL,
    approver_id INT NOT NULL,
    approval_role NVARCHAR(50), -- DEPT_HEAD, QMS_REVIEWER, FINAL_APPROVER
    status NVARCHAR(20), -- APPROVED, REJECTED, REWORK
    comments NVARCHAR(MAX),
    approval_date DATETIME DEFAULT GETDATE()
);
