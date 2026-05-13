# Autonoma ERP — Module Creation Checklist

When creating or standardizing a module, ensure every item on this list is checked off before submitting a Pull Request. This ensures 100% compliance with the BOS Architecture.

## 🗄️ 1. Database & Backend
- [ ] Database migration script created in `db/migration/` (e.g., `V6.0__Add_Table__TIS.sql`).
- [ ] Migration script tested locally via `sqlcmd` using `IF NOT EXISTS`.
- [ ] JPA Entity created/updated in `com.autonoma.erp.model`.
- [ ] JPA Column mappings exactly match the SQL script names.
- [ ] Controller uses standard `@RequestMapping` (e.g., `/api/hrm/asset`).
- [ ] API successfully returns `200 OK` without throwing 500 mapping errors.

## 🌐 2. API Wiring
- [ ] Hardcoded URLs (like `http://localhost:8081`) have been completely removed.
- [ ] Endpoints are defined in `Autonoma_ERP/src/utils/api-constants.js` under `API_PATHS`.
- [ ] Replaced raw `axios` imports with `import axios from 'utils/axios'`.
- [ ] Replaced all raw `fetch()` calls with `axios`.

## 🏗️ 3. BOS UI Components
- [ ] Standard layout wrappers are used (`MainCard`).
- [ ] Data tables strictly use `BOSDataTable` (no custom `<table>` or raw MUI `Table`).
- [ ] Dialogs strictly use `BOSFormDialog`.
- [ ] Text inputs strictly use `BOSTextField`.
- [ ] Deleted raw `window.confirm()` calls and replaced them with `ConfirmDeleteDialog`.

## 🔐 4. Data Security & Validation
- [ ] Form validation is handled consistently (e.g., via `useBOSValidation` or Formik).
- [ ] Replaced all direct `dangerouslySetInnerHTML` with `sanitizeHTML()` to prevent XSS.

## 📎 5. File Uploads & Previews
- [ ] Replaced custom file input elements with `<BOSFileUpload>`.
- [ ] All file viewing actions trigger `<BOSFilePreview>` (the universal Eye button).
- [ ] Verified that uploaded files are routed correctly to `D:\BOS_DOCUMENTS` via `BosDocConstants.java`.

## ⌨️ 6. UX Enhancements
- [ ] Keyboard shortcuts are implemented using `useKeyboardShortcuts` (e.g., `Ctrl+S` to save, `Ctrl+N` to add).
- [ ] Global search and filter functions are synced via `setFilterConfig` (if applicable).
- [ ] Notifications strictly use `dispatch(openSnackbar(...))` (no raw MUI `Snackbar` or `Alert` wrappers).
