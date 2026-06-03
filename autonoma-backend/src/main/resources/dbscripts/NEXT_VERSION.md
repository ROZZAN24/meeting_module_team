# 📌 Database Migration Version Registry

Before creating a new database migration script, you **MUST** claim a version number from this file to prevent duplicates.

---

## 🚦 How to Claim a Version Number

1. Open this file (`NEXT_VERSION.md`) in your branch.
2. Read the **Last Claimed Version** below.
3. Choose the next sequential version number.
4. Add a new row to the **Claim Registry** table below with your name, date, and description.
5. Commit this file **FIRST** as a single commit and push it. This ensures if anyone else is working, they will see a merge conflict immediately if they tried to claim the same version.
6. Create your migration script in `dbscripts/` named `2026MMDD_V<YourVersion>.0__Description.sql`.

---

## 🔢 Current Status

* **Last Claimed Version:** `V75`
* **Next Available Version:** `V76`

---

## 📋 Claim Registry (Claimed Versions)

| Version | Developer | Date claimed | PR / Feature Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| **V63** | System baseline | 2026-05-31 | Last legacy incremental script added | ✅ Merged |
| **V64** | Eashwara Prasadh | 2026-06-02 | Drop And Rename Tables (Baseline cleanup) | ✅ Merged |
| **V65** | Darshan | 2026-06-02 | Add Frequency to Audit Schedule | ✅ Merged |
| **V66** | Darshan | 2026-06-02 | Alter Audit Criteria Columns To NVARCHAR(MAX) | ✅ Merged |
| **V67** | Darshan | 2026-06-02 | Swap Audit Area And Type Page Codes | ✅ Merged |
| **V68** | Eashwara Prasadh | 2026-06-02 | Cleanup Created By audit columns | ✅ Merged |
| **V69** | Eashwara Prasadh | 2026-06-02 | Cleanup Updated By audit columns | ✅ Merged |
| **V70** | Eashwara Prasadh | 2026-06-02 | Rename IsBosAdmin To UserLevel | ✅ Merged |
| **V71** | Eashwara Prasadh | 2026-06-02 | Add Tenant Id To User Credential | ✅ Merged |
| **V72** | Eashwara Prasadh | 2026-06-02 | Seed Organization Chart Page | ✅ Merged |
| **V73** | Eashwara Prasadh | 2026-06-02 | Add Input Case Style To Company | ✅ Merged |
| **V74** | Naveena / TIS | 2026-06-02 | Add L6/L7 Designation Levels | ✅ Merged |
| **V75** | Naveena / TIS | 2026-06-02 | Add Requested Departments | ✅ Merged |

*Junior developers: If you are unsure, ask the Main Branch In-Charge before claiming a version.*
