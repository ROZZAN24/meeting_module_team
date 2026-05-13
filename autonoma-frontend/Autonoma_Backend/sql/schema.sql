-- QMS Checklist Module Schema
-- Database: AUTONOMA
-- Port: 3306

CREATE DATABASE IF NOT EXISTS AUTONOMA;
USE AUTONOMA;

-- 1. Status Master Table (Standardized statuses)
CREATE TABLE IF NOT EXISTS STATUS_MASTER (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Master Checklist Table (Task Definitions)
CREATE TABLE IF NOT EXISTS QMS_MASTER_CHECKLIST (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    seq_no VARCHAR(50),
    checking_point VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    frequency VARCHAR(50),
    effective_from DATE,
    expiry_date DATE,
    reminder_days INT,
    reminder_date DATE,
    stock_link VARCHAR(10),
    photo_required VARCHAR(10),
    verification_required VARCHAR(10),
    status VARCHAR(50) DEFAULT 'Pending for Verify',
    created_by VARCHAR(100),
    created_date DATETIME,
    updated_by VARCHAR(100),
    updated_date DATETIME
);

-- 3. Checklist Department Mapping (Many-to-Many)
CREATE TABLE IF NOT EXISTS QMS_CHECKLIST_DEPARTMENT (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    checklist_id BIGINT NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (checklist_id) REFERENCES QMS_MASTER_CHECKLIST(id) ON DELETE CASCADE
);

-- 4. Checklist Assignment Table (Task Instances)
CREATE TABLE IF NOT EXISTS QMS_CHECKLIST_ASSIGNMENT (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    checklist_id BIGINT NOT NULL,
    assigned_to VARCHAR(100),
    assigned_by VARCHAR(100),
    assigned_date DATETIME,
    checklist_date DATE,
    next_due_date DATE,
    status_id BIGINT,
    remarks TEXT,
    FOREIGN KEY (checklist_id) REFERENCES QMS_MASTER_CHECKLIST(id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(id)
);

-- 5. Checklist Verification Table (Audit History)
CREATE TABLE IF NOT EXISTS QMS_CHECKLIST_VERIFICATION (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    verified_by VARCHAR(100),
    status_id BIGINT,
    remarks TEXT,
    verified_date DATETIME,
    FOREIGN KEY (assignment_id) REFERENCES QMS_CHECKLIST_ASSIGNMENT(id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(id)
);

-- Seed Initial Statuses
INSERT IGNORE INTO STATUS_MASTER (name) VALUES 
('Pending'), ('Started'), ('Unresolved'), ('Missed'), ('Completed'), 
('Not Completed'), ('25%'), ('50%'), ('75%'), ('Pending for Verified'), 
('Verified'), ('Pending for Accepted'), ('Accepted'), ('Attended'), ('Rejected'), ('Open');
