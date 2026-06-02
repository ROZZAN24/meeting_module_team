-- V6.4: Add material list to MOM detail for SOP compliance
-- Allows linking discussion points to specific RM or PRODUCT items
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('qms_mom_detail') AND name = 'material_list')
BEGIN
    ALTER TABLE qms_mom_detail ADD material_list NVARCHAR(MAX);
    PRINT 'Added material_list to qms_mom_detail';
END;
