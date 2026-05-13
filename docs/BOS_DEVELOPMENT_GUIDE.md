# Autonoma ERP — Developer Handbook (BOS Standard)

This guide serves as the canonical reference for developing new modules, reusing BOS components, and handling database migrations safely. It ensures all 9 developers follow the same standard, avoiding UI inconsistencies and database conflicts.

---

## 1. How to Build a New Module (End-to-End)

When building a new module (e.g., `Asset Management`), follow this exact sequence:

### Step 1: Database Migration
1. **Never use Hibernate `ddl-auto=update` in production/shared environments.**
2. Write a manual SQL script in the backend repository under `src/main/resources/db/migration/`.
3. **Naming Convention:** `V<Next_Version>__<Description>__TIS.sql`
   - *Example:* `V6.0__Create_Asset_Master__TIS.sql`
   - *Note:* The `__TIS` suffix distinguishes our standardized scripts from older, non-standard migrations.
4. **Content Rules:**
   - Always use `IF NOT EXISTS` for table and column creation to prevent crashes on reruns.
   - Set boolean/status columns to `UPPERCASE` by default (`ACTIVE`, `INACTIVE`).
   - Define explicit Foreign Key (`FK`) constraints.
5. **Execution:** Since Flyway may be disabled in some environments to prevent conflicts with legacy manual changes, always execute your script manually via `sqlcmd` against your local DB before pushing.

### Step 2: Backend JPA Entity
1. Create the entity class in `com.autonoma.erp.model`.
2. Use `@Table(name = "table_name")`. Ensure the table name exactly matches the database.
3. Map every column explicitly with `@Column(name = "column_name")`.
4. Avoid duplicating columns (e.g., having both `createdAt` and `created_at` in the DB).

### Step 3: API Controller & Routing
1. Create your controller and map it using standard REST patterns.
2. Ensure you handle JWT authentication appropriately.

### Step 4: Frontend API Constants
1. **Never hardcode URLs (like `http://localhost:8081`) in your React components.**
2. Open `Autonoma_ERP/src/utils/api-constants.js`.
3. Add your endpoints to the central object (e.g., `API_PATHS.ASSET.LIST`).

---

## 2. How to Properly Reuse BOS UI Components

To maintain UI consistency across the entire ERP, you **must** use the central `BOS` components located in `src/ui-component/bos/`. **Do not** write custom MUI components for standard layouts.

### ✅ Do's and ❌ Don'ts
- ❌ **Do not** use `window.confirm()`. ✅ **Do** use `ConfirmDeleteDialog`.
- ❌ **Do not** use `fetch()` or raw `axios`. ✅ **Do** import `axios` from `utils/axios`.
- ❌ **Do not** use raw `<table>`. ✅ **Do** use `BOSDataTable`.
- ❌ **Do not** use `dangerouslySetInnerHTML` directly. ✅ **Do** use `sanitizeHTML()` from `utils/sanitize.js`.

### Key Components

#### 1. BOSDataTable (`ui-component/bos/BOSDataTable.jsx`)
Use for all list views. It supports pagination, search, editing, and deleting out-of-the-box.
```jsx
<BOSDataTable
  columns={[{ key: 'empCode', label: 'Code' }, { key: 'name', label: 'Name' }]}
  data={employees}
  onEditRow={(row) => openEditDialog(row)}
  onDeleteRow={(row) => handleDelete(row.id)}
/>
```

#### 2. BOSFormDialog (`ui-component/bos/BOSFormDialog.jsx`)
Use for all Create/Edit forms. Do not open pages for forms unless they are extremely complex; use dialogs instead.
```jsx
<BOSFormDialog
  open={open}
  title="Add Employee"
  onClose={handleClose}
  onSave={handleSave}
>
  <BOSTextField label="Employee Name" value={name} onChange={setName} />
</BOSFormDialog>
```

#### 3. BOSFileUpload (`ui-component/bos/BOSFileUpload.jsx`)
Use for all document uploads. It enforces the central `D:\BOS_DOCUMENTS` directory structure.
```jsx
<BOSFileUpload
  multiple={true}
  accept=".pdf,.docx,image/*"
  files={attachments}
  onChange={(newFiles) => setAttachments(newFiles)}
/>
```

#### 4. BOSFilePreview (`ui-component/bos/BOSFilePreview.jsx`)
The universal "Eye Button". Use this to preview uploaded files without downloading them. It handles PDFs, Images, Word, and Excel files natively in the browser.
```jsx
<BOSFilePreview
  open={previewOpen}
  onClose={() => setPreviewOpen(false)}
  file={{ serverFileName: 'Sales/Enquiry/123_doc.pdf', isServer: true }}
/>
```

#### 5. BOSExportButton (`ui-component/bos/BOSExportButton.jsx`)
Standardized Excel exporter. Place this next to your `BOSDataTable`.
```jsx
<BOSExportButton data={tableData} filename="Asset_List" />
```

---

## 3. Handling File Uploads
1. All files are saved centrally to `D:\BOS_DOCUMENTS`.
2. Do not save files to the database as BLOBs; save the file path string instead.
3. The backend `FileService.java` automatically routes files to subdirectories (e.g., `QMS/Checklist`) based on the module flag sent from `BOSFileUpload`.
