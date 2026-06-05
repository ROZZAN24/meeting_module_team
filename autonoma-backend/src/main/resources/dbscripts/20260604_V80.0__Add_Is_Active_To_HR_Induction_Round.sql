-- ============================================================
-- Migration: Add IS_ACTIVE column to HR_INDUCTION_ROUND table
-- Purpose: Support isActive field in InductionRoundMaster model
-- Date: 2026-06-04
-- ============================================================

IF OBJECT_ID('HR_INDUCTION_ROUND', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('HR_INDUCTION_ROUND', 'IS_ACTIVE') IS NULL
    BEGIN
        ALTER TABLE HR_INDUCTION_ROUND ADD IS_ACTIVE BIT DEFAULT 1;
    END
END
GO

-- Backfill existing records to have IS_ACTIVE = 1 (true)
IF OBJECT_ID('HR_INDUCTION_ROUND', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('HR_INDUCTION_ROUND', 'IS_ACTIVE') IS NOT NULL
    BEGIN
        EXEC('UPDATE HR_INDUCTION_ROUND SET IS_ACTIVE = 1 WHERE IS_ACTIVE IS NULL');
    END
END
GO
