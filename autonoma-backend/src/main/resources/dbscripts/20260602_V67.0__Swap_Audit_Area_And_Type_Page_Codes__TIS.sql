-- 20260602_V66.0__Swap_Audit_Area_And_Type_Page_Codes.sql
-- Swap page codes between Audit Area (previously M1120) and Audit Type (previously M1110) in BOS_PAGES.

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[BOS_PAGES]') AND name = 'PAGE_CODE')
BEGIN
    UPDATE BOS_PAGES SET PAGE_CODE = 'M1110_TEMP' WHERE PAGE_CODE = 'M1110';
    UPDATE BOS_PAGES SET PAGE_CODE = 'M1110' WHERE PAGE_CODE = 'M1120';
    UPDATE BOS_PAGES SET PAGE_CODE = 'M1120' WHERE PAGE_CODE = 'M1110_TEMP';
END
GO
