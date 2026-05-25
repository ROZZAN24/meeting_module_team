-- ============================================
-- Fix Missing Column : accounts_ledger
-- Table : sm_customer_master
-- ============================================

IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'sm_customer_master'
    AND COLUMN_NAME = 'accounts_ledger'
)
BEGIN
    ALTER TABLE sm_customer_master
    ADD accounts_ledger NVARCHAR(255) NULL;
END
GO