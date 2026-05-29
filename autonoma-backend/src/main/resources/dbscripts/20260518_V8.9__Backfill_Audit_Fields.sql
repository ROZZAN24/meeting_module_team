UPDATE sm_delivery_terms SET created_at = GETDATE(), updated_at = GETDATE(), created_by = 'Admin', updated_by = 'Admin' WHERE created_at IS NULL;
GO

UPDATE sm_payment_terms SET created_at = GETDATE(), updated_at = GETDATE(), created_by = 'Admin', updated_by = 'Admin' WHERE created_at IS NULL;
GO

UPDATE sm_type_of_service SET created_at = GETDATE(), updated_at = GETDATE(), created_by = 'Admin', updated_by = 'Admin' WHERE created_at IS NULL;
GO

UPDATE sm_currency SET created_at = GETDATE(), updated_at = GETDATE(), created_by = 'Admin', updated_by = 'Admin' WHERE created_at IS NULL;
GO

UPDATE sm_segment SET created_at = GETDATE(), updated_at = GETDATE(), created_by = 'Admin', updated_by = 'Admin' WHERE created_at IS NULL;
GO

UPDATE sm_sub_segment SET created_at = GETDATE(), updated_at = GETDATE(), created_by = 'Admin', updated_by = 'Admin' WHERE created_at IS NULL;
GO

UPDATE MASTER_COUNTRY SET created_at = GETDATE(), updated_at = GETDATE(), created_by = 'Admin', updated_by = 'Admin' WHERE created_at IS NULL;
GO

UPDATE MASTER_STATE SET created_at = GETDATE(), updated_at = GETDATE(), created_by = 'Admin', updated_by = 'Admin' WHERE created_at IS NULL;
GO

UPDATE sm_customer_master SET created_at = GETDATE(), updated_at = GETDATE(), created_by = 'Admin', updated_by = 'Admin' WHERE created_at IS NULL;
GO

UPDATE sm_supplier_master SET created_at = GETDATE(), updated_at = GETDATE(), created_by = 'Admin', updated_by = 'Admin' WHERE created_at IS NULL;
GO
