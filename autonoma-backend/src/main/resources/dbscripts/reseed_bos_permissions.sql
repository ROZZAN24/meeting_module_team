-- Reseed modules, submodules, pages and permissions
BEGIN TRANSACTION;
DELETE FROM bos_user_page_auth;
DELETE FROM bos_pages;
DELETE FROM bos_sub_modules;
DELETE FROM bos_modules;

SET IDENTITY_INSERT BOS_MODULES ON;

INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (1, 'M0000', 'Masters');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (2, 'HA0000', 'HR & Admin');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (3, 'DD0000', 'Design & Development');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (4, 'SM0000', 'Sales & Marketing');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (5, 'PP0000', 'Planning & Purchase');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (6, 'P0000', 'Production');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (7, 'Q0000', 'Quality');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (8, 'SL0000', 'Stores & Logistics');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (9, 'FA0000', 'Finance & Accounts');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (10, 'MS0000', 'Maintenance & Services');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (11, 'QM0000', 'Quality Management Systems');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (12, 'R0000', 'Reports');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (13, 'S0000', 'Support');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (14, 'AD0000', 'Admin');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (15, 'DB0000', 'Dashboard');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (30, 'HRA', 'HRA');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (40, 'SM', 'Sales & Marketing');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (50, 'QMS_TRANS', 'Quality Management Systems');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (60, 'SUPPORT', 'Support');
INSERT INTO bos_modules (module_id, mod_code, mod_name) VALUES (70, 'ADMIN', 'Admin');

SET IDENTITY_INSERT BOS_MODULES OFF;

SET IDENTITY_INSERT BOS_SUB_MODULES ON;

INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (1, 1, NULL, 'NULL', 'HR');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (2, 1, NULL, 'NULL', 'QMS');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (3, 1, NULL, 'NULL', 'NPD');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (4, 1, NULL, 'NULL', 'SALES');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (5, 1, NULL, '1', 'ATS');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (6, 1, NULL, '1', 'EMPLOYEE');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (7, 1, NULL, '1', 'PAYROLL');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (8, 1, NULL, '2', 'CHECKLIST');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (9, 1, NULL, '2', 'AUDIT');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (10, 1, NULL, 'NULL', 'M1000');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (11, 1, NULL, '10', 'M1100');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (12, 1, NULL, '10', 'M1200');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (13, 1, NULL, '10', 'M1300');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (14, 1, NULL, '4', 'VENDOR');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (20, 1, NULL, 'NULL', 'M2000');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (21, 1, NULL, '20', 'M2100');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (22, 1, NULL, '20', 'M2200');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (23, 1, NULL, '20', 'M2300');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (30, 1, NULL, 'NULL', 'M3000');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (31, 1, NULL, '30', 'M3100');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (32, 1, NULL, '30', 'M3200');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (40, 1, NULL, 'NULL', 'M4000');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (41, 1, NULL, '40', 'M4100');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (42, 1, NULL, '40', 'M4200');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (50, 1, NULL, 'NULL', 'M5000');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (51, 1, NULL, '50', 'M5100');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (52, 1, NULL, '50', 'M5200');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (111, 11, NULL, 'NULL', 'QM1100');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (112, 11, NULL, 'NULL', 'QM1200');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (113, 11, NULL, 'NULL', 'QM1300');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (131, 13, NULL, 'NULL', 'S1100');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (141, 14, NULL, 'NULL', 'AD1100');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (142, 14, NULL, 'NULL', 'AD1200');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (151, 15, NULL, 'NULL', 'DB1100');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (201, 2, NULL, 'NULL', 'HA1100');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (301, 30, NULL, 'NULL', 'HRA_EMP');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (302, 30, NULL, 'NULL', 'HRA_IND');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (401, 40, NULL, 'NULL', 'SM_OCR');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (411, 4, NULL, 'NULL', 'SM1100');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (501, 50, NULL, 'NULL', 'QMS_CL');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (502, 50, NULL, 'NULL', 'QMS_AU');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (503, 50, NULL, 'NULL', 'QMS_MT');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (701, 70, NULL, 'NULL', 'AD_HUB');
INSERT INTO bos_sub_modules (sub_mod_id, mod_id, parent_sub_mod_id, sub_mod_code, sub_mod_name) VALUES (702, 70, NULL, 'NULL', 'AD_BOS');

SET IDENTITY_INSERT BOS_SUB_MODULES OFF;

SET IDENTITY_INSERT BOS_PAGES ON;

INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (1, 1, 4, '1', '1', 12);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (2, 1, 4, '2', '1', 13);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (3, 1, 2, '3', '1', 10);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (4, 14, 141, 'AD1110', 'Company Profile', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (5, 14, 141, 'AD1120', 'Division Master (Units)', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (6, 14, 141, 'AD1130', 'User Credentials', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (7, 14, 141, 'AD1140', 'User Access', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (8, 14, 141, 'AD1150', 'Audit Trail', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (9, 14, 141, 'AD1160', 'User Session Analytics', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (10, 14, 141, 'AD1170', 'File Traceability Hub', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (11, 14, 142, 'AD1210', 'Business Authorization', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (12, 14, 142, 'AD1220', 'App Preference', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (13, 14, 142, 'AD1230', 'Prefix/Suffix Credentials', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (14, 14, 142, 'AD1240', 'Session Monitoring', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (15, 15, 151, 'DB1110', 'Default', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (16, 15, 151, 'DB1120', 'Analytics', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (17, 15, 151, 'DB1130', 'Invoice', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (18, 15, 151, 'DB1140', 'CRM', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (19, 15, 151, 'DB1150', 'Blog', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (20, 10, NULL, 'DB_03', 'Invoice', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (21, 10, NULL, 'DB_04', 'CRM', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (22, 10, NULL, 'DB_05', 'Blog', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (23, 2, 201, 'HA1110', 'Application Tracking System', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (24, 30, 301, 'HRA_EMP_01', 'Employee Master (HRA)', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (25, 30, 302, 'HRA_IND_01', 'INDUCTION PENDING', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (26, 30, 302, 'HRA_IND_02', 'INDUCTION TRAINING', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (27, 30, 302, 'HRA_IND_03', 'INDUCTION TRAINEE', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (28, 1, 5, 'HR_ATS_01', 'INDUCTION CRITERIA', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (29, 5, 7, 'HR_PY_01', 'Holiday', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (30, 5, 7, 'HR_PY_02', 'Bank Details', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (31, 1, 11, 'M1110', 'Audit Type', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (32, 1, 11, 'M1120', 'Audit Area / Zone', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (33, 1, 11, 'M1130', 'Audit Criteria', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (34, 1, 12, 'M1210', 'Check List Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (35, 1, 13, 'M1310', 'Meeting Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (36, 1, 13, 'M1320', 'Unnamed Page', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (37, 1, 21, 'M2110', 'Interview Criteria Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (38, 1, 21, 'M2120', 'Email Content Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (39, 1, 21, 'M2130', 'Applicant Verification Criteria', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (40, 1, 21, 'M2140', 'Induction Criteria', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (41, 1, 21, 'M2150', 'Induction Pending', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (42, 1, 21, 'M2160', 'Induction Training', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (43, 1, 21, 'M2170', 'Induction Trainee', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (44, 1, 22, 'M2210', 'Employee Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (45, 1, 22, 'M2220', 'Employee Type', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (46, 1, 22, 'M2230', 'Department', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (47, 1, 22, 'M2240', 'Designation', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (48, 1, 22, 'M2250', 'Level', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (49, 1, 22, 'M2260', 'Grade', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (50, 1, 22, 'M2270', 'Employee Satisfaction Criteria', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (51, 1, 23, 'M2310', 'Holiday', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (52, 1, 23, 'M2320', 'Bank Details', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (53, 1, 23, 'M2330', 'Shift', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (54, 1, 23, 'M2340', 'Loan Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (55, 1, 23, 'M2350', 'Leave Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (56, 1, 23, 'M2360', 'Permission Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (57, 1, 23, 'M2370', 'Petrol Allowance', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (58, 1, 23, 'M2380', 'Policy Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (59, 1, 31, 'M3110', 'Product Item Group', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (60, 1, 31, 'M3120', 'Product Item Type', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (61, 1, 31, 'M3130', 'Product Item Sub Type', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (62, 1, 31, 'M3140', 'Product OEM Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (63, 1, 31, 'M3150', 'Product OEM Mapping', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (64, 1, 31, 'M3160', 'Product Model Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (65, 1, 31, 'M3170', 'Product Capacity Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (66, 1, 31, 'M3180', 'Process Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (67, 1, 32, 'M3210', 'Wind Farm Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (68, 1, 41, 'M4110', 'Supplier Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (69, 1, 42, 'M4210', 'Sub Contractor', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (70, 1, 51, 'M5110', 'Customer Satisfaction Criteria', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (71, 1, 51, 'M5120', 'Contact Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (72, 1, 51, 'M5130', 'Customer Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (73, 1, 51, 'M5140', 'Customer Potential', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (74, 1, 52, 'M5210', 'Payment Terms', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (75, 1, 52, 'M5220', 'Delivery Terms', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (76, 1, 52, 'M5230', 'Currency', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (77, 1, 52, 'M5240', 'Unit of Measurement', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (78, 1, 52, 'M5250', 'Country Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (79, 1, 52, 'M5260', 'State Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (80, 1, 52, 'M5270', 'Segment', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (81, 1, 52, 'M5280', 'Sub Segment', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (82, 1, 52, 'M5290', 'Mode of Despatch', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (83, 1, 52, 'M5300', 'Freight', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (84, 1, 1, 'M_HR_01', 'Interview Criteria Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (85, 1, 1, 'M_HR_02', 'Email Content Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (86, 1, 2, 'M_QMS_01', 'Check List Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (87, 11, 111, 'QM1110', 'Checklist Verify', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (88, 11, 111, 'QM1120', 'Close Checklist / Renewal', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (89, 11, 111, 'QM1130', 'Checklist / Renewal Verify', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (90, 11, 111, 'QM1140', 'Checklist / Renewal Report', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (91, 11, 112, 'QM1210', 'Audit Schedule', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (92, 11, 112, 'QM1220', 'Audit User Attendance', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (93, 11, 112, 'QM1230', 'Audit Observation', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (94, 11, 112, 'QM1240', 'Close NCR / OFI', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (95, 11, 112, 'QM1250', 'Audit NCR / OFI Approval', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (96, 11, 112, 'QM1260', 'Audit Report', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (97, 11, 113, 'QM1310', 'Meeting Schedule', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (98, 11, 113, 'QM1320', 'Meeting User Attendance', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (99, 11, 113, 'QM1330', 'Minutes of Meeting', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (100, 11, 113, 'QM1340', 'Close MOM', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (101, 11, 113, 'QM1350', 'MOM Approval', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (102, 13, 131, 'S1110', 'Support Ticket', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (103, 13, 131, 'S1120', 'Raised For Me', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (104, 4, 411, 'SM1110', 'Enquiry Dashboard', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (105, 4, 411, 'SM1120', 'Enquiry', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (106, 4, 411, 'SM1130', 'Price Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (107, 4, 411, 'SM1140', 'Quotation', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (108, 60, NULL, 'SUP_01', 'Support Ticket', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (109, 4, 12, 'S_CRM_01', 'Customer Master', 1);
INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled) VALUES (110, 4, 12, 'S_CRM_02', 'Contact Master', 1);

SET IDENTITY_INSERT BOS_PAGES OFF;


-- Grant default full access to all existing users for all pages
INSERT INTO bos_user_page_auth (user_id, page_id, sub_mod_id, mod_id, enable, read_acs, [write], delete_acs, export, approval, manager, additional1, additional2, add_task_enable)
SELECT 
    u.user_id, 
    p.page_id, 
    p.sub_mod_id, 
    p.mod_id, 
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1
FROM bos_pages p
CROSS JOIN ad_user_credential u;

COMMIT TRANSACTION;