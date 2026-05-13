# Autonoma BOS — Module Development Guide

> **For AI models & developers**: This is the single source of truth for building any new module in the Autonoma ERP (BOS). Follow every rule exactly.

---

## 1. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 7 + MUI 7 (Berry Template) |
| State | Redux Toolkit (`store/slices/`) |
| HTTP | Axios (`utils/axios.js` → baseURL `http://localhost:3010/`) |
| Icons | `@tabler/icons-react` |
| Backend | Spring Boot 3.2 + JPA/Hibernate |
| Database | SQL Server (Docker, port 1433) |
| Auth | JWT (`contexts/JWTContext.jsx`) |

---

## 2. Project Structure (Critical Paths)

```
src/
├── ui-component/bos/          ← BOS COMPONENT LIBRARY (use these!)
│   ├── BOSStyles.js           ← Centralized style tokens
│   ├── BOSFormDialog.jsx      ← Reusable dialog wrapper
│   ├── BOSFormSection.jsx     ← Section card inside dialogs
│   ├── BOSDataTable.jsx       ← Universal data table
│   ├── BOSTextField.jsx       ← Themed text field
│   └── index.js               ← Barrel export
├── ui-component/
│   ├── ConfirmDeleteDialog.jsx ← Delete confirmation popup
│   ├── FormRow.jsx             ← Label+input row layout
│   └── templates/
│       └── PremiumFormDialogTemplate.jsx ← COPY THIS for new modules
├── hooks/
│   ├── useKeyboardShortcuts.js ← Keyboard shortcut hook
│   ├── useBOSValidation.js     ← Centralized form validation
│   └── useSearchFilter.js
├── store/slices/
│   ├── search.js               ← Global search/filter state
│   └── snackbar.js             ← Toast notification state
├── routes/MainRoutes.jsx       ← ADD NEW ROUTES HERE
├── menu-items/erp.js           ← ADD NEW MENU ITEMS HERE
├── themes/                     ← Berry theme (DO NOT modify)
├── views/
│   ├── master/                 ← Master modules (HR, etc.)
│   └── qms/                    ← QMS modules
└── utils/
    ├── axios.js                ← Axios instance
    └── excelExport.js          ← Excel export utility
```

---

## 3. SOP Rules Summary (18 Rules)

| # | Rule | How It's Enforced |
|---|------|-------------------|
| 1 | **Button Colors**: Save=Green, Edit/New=Blue, Delete=Red, Cancel=Gray | `BOSStyles.js` exports `btnSave`, `btnEdit`, `btnDelete`, `btnCancel` |
| 2 | **Page Alignment**: Fixed responsive layout | `BOSDataTable` + `MainCard` wrapper |
| 3 | **No extra styles**: Professional consistent theme | All styles from `BOSStyles.js` only |
| 4 | **Shortcut Keys**: Ctrl+S=Save, Ctrl+E=Edit, Ctrl+D=Delete, Esc=Close, Ctrl+N=New | `useKeyboardShortcuts` hook + `shortcutTooltip()` |
| 5 | **Delete Confirmation**: Center popup before delete | `ConfirmDeleteDialog` component — NEVER use `window.confirm()` |
| 6 | **Page Validation**: Required, empty, duplicate, number format | `useBOSValidation` hook |
| 7 | **Double-Click Edit**: Row double-click opens edit | `BOSDataTable` `onDoubleClickRow` prop |
| 8 | **Menu Alignment**: Consistent menu positioning | `menu-items/erp.js` structure |
| 9 | **Mandatory (*) Fields**: Asterisk + validation message | `BOSTextField` `required` prop + `useBOSValidation` |
| 10 | **Max Length**: Input maxLength enforcement | `BOSTextField` `maxLength` prop |
| 11 | **Clean Dialogs**: No thick borders, modern popups | `BOSFormDialog` with `borderRadius: 24px`, blur backdrop |
| 12 | **Button Placement**: Same position every page | `BOSFormDialog` footer: Left=Delete+Clear, Right=Save |
| 13 | **Multi-Language**: UTF-8 support | Standard React/Spring Boot UTF-8 |
| 14 | **Upload**: Single-click upload | `<input type="file" hidden />` inside `<Button component="label">` |
| 15 | **Scrollable Tables**: Large data with scroll | `BOSDataTable` with `height: calc(100vh - 240px)` + overflow |
| 16 | **Global Filter**: Search across all visible columns | Redux `search` slice + `useMemo` filtering |
| 17 | **Retain BOS Concepts**: Keep old ERP workflows | Match existing patterns |
| 18 | **Modern UI**: Clean spacing, proper fonts, responsive | Berry theme + BOS components |

---

## 4. Creating a New Master Module (Step-by-Step)

### Step 1: Backend (Spring Boot)

Create 3 files in `Autonoma_Backend/src/main/java/com/autonoma/erp/`:

**a) Model** — `model/YourEntity.java`
```java
@Entity
@Table(name = "your_entity")
public class YourEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private String status = "ACTIVE";
    private String createdBy;
    private LocalDateTime createdDate = LocalDateTime.now();
    private String updatedBy;
    private LocalDateTime updatedDate;
    // getters + setters
}
```

**b) Repository** — `repository/YourEntityRepository.java`
```java
public interface YourEntityRepository extends JpaRepository<YourEntity, Long> {}
```

**c) Controller** — `controller/YourEntityController.java`
```java
@RestController
@RequestMapping("/api/master/your-module")
@CrossOrigin(origins = "*")
public class YourEntityController {
    @Autowired private YourEntityRepository repo;

    @GetMapping    public List<YourEntity> getAll() { return repo.findAll(); }
    @PostMapping   public YourEntity create(@RequestBody YourEntity e) { return repo.save(e); }
    @PutMapping("/{id}") public YourEntity update(@PathVariable Long id, @RequestBody YourEntity e) {
        e.setId(id); return repo.save(e);
    }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { repo.deleteById(id); }
}
```

### Step 2: Frontend — Add Dialog (`AddYourEntityDialog.jsx`)

```jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MenuItem, useTheme } from '@mui/material';
import { IconSettings } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSFormDialog, BOSFormSection, BOSTextField } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useBOSValidation from 'hooks/useBOSValidation';

const VALIDATION_RULES = [
  { field: 'name', label: 'Name', required: true, maxLength: 100 },
];

const INITIAL_STATE = { name: '', description: '', status: 'ACTIVE' };

const AddYourEntityDialog = ({ open, handleClose, initialData, readOnly = false }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { errors, validate, clearErrors } = useBOSValidation();
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    clearErrors();
    if (initialData) {
      setFormData({ id: initialData.id, name: initialData.name || '', description: initialData.description || '', status: initialData.status || 'ACTIVE' });
      setIsEditing(false);
    } else {
      setFormData(INITIAL_STATE);
      setIsEditing(!readOnly);
    }
  }, [initialData, open, readOnly, clearErrors]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleClear = () => { setFormData(INITIAL_STATE); clearErrors(); };

  const handleSave = async () => {
    if (!validate(formData, VALIDATION_RULES)) return;
    try {
      if (formData.id) {
        await axios.put(`/api/master/your-module/${formData.id}`, formData);
        dispatch(openSnackbar({ open: true, message: 'Updated!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        await axios.post('/api/master/your-module', formData);
        dispatch(openSnackbar({ open: true, message: 'Created!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      }
      handleClose(true);
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`/api/master/your-module/${formData.id}`);
      dispatch(openSnackbar({ open: true, message: 'Deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      handleClose(true);
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const isViewOnly = readOnly && !isEditing;

  return (
    <>
      <BOSFormDialog open={open} onClose={() => handleClose()} onSave={handleSave} onDelete={() => setDeleteOpen(true)} onClear={handleClear} onEditClick={() => setIsEditing(true)} title={initialData ? 'Edit Entity' : 'New Entity'} isViewOnly={isViewOnly} hasId={!!formData.id}>
        <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Details">
          <BOSTextField name="name" label="Name" value={formData.name} onChange={handleChange} disabled={isViewOnly} required maxLength={100} error={!!errors.name} helperText={errors.name} />
          <BOSTextField name="description" label="Description" multiline rows={3} value={formData.description} onChange={handleChange} disabled={isViewOnly} maxLength={255} />
          <BOSTextField select name="status" label="Status" value={formData.status} onChange={handleChange} disabled={isViewOnly}>
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
          </BOSTextField>
        </BOSFormSection>
      </BOSFormDialog>
      <ConfirmDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDeleteConfirm} title="Delete Entity" message="Are you sure? This cannot be undone." itemName={formData.name} />
    </>
  );
};

AddYourEntityDialog.propTypes = { open: PropTypes.bool, handleClose: PropTypes.func, initialData: PropTypes.object, readOnly: PropTypes.bool };
export default AddYourEntityDialog;
```

### Step 3: Frontend — List Page (`YourEntityMaster.jsx`)

```jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip } from '@mui/material';
import { IconFileDownload, IconSettings } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import AddYourEntityDialog from './AddYourEntityDialog';
import { exportToExcel } from 'utils/excelExport';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, btnExport, btnNew } from 'ui-component/bos';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'name', label: 'Name', minWidth: 180, bold: true },
  { id: 'description', label: 'Description', minWidth: 250 },
  { id: 'createdBy', label: 'Created User', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated User', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 },
  { id: 'status', label: 'Status', minWidth: 100 }
];

export default function YourEntityMaster() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((s) => s.search.query);
  const globalFilters = useSelector((s) => s.search.filters);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  // Global filter config — set on mount, clear on unmount
  useEffect(() => {
    dispatch(setFilterConfig([
      { id: 'status', label: 'Status', type: 'select', options: [{ value: 'All', label: 'ALL' }, { value: 'ACTIVE', label: 'ACTIVE' }, { value: 'INACTIVE', label: 'INACTIVE' }], defaultValue: 'ACTIVE' }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { setRows((await axios.get('/api/master/your-module')).data); }
    catch (e) { console.error(e); setRows([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh) fetchData(); };
  const handleDeleteClick = (row) => { setDeleteTargetId(row.id); setDeleteTargetName(row.name); setDeleteDialogOpen(true); };
  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`/api/master/your-module/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchData();
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  useKeyboardShortcuts({ 'ctrl+n': handleOpenAdd, escape: () => { if (dialogOpen) handleCloseDialog(); } });

  const filteredRows = useMemo(() => rows.filter((r) => {
    const sf = globalFilters.status || 'All';
    if (sf !== 'All' && r.status !== sf) return false;
    if (globalQuery && !(r.name?.toLowerCase().includes(globalQuery.toLowerCase()))) return false;
    return true;
  }), [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  return (
    <MainCard
      title={<Stack direction="row" alignItems="center" spacing={1.5}><IconSettings size={24} /><Typography variant="h3">Your Entity Master</Typography></Stack>}
      secondary={
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" color="primary" size="medium" startIcon={<IconFileDownload size={18} />} onClick={() => exportToExcel(filteredRows, 'Export')} sx={btnExport}>Export Excel</Button>
          <Tooltip title={shortcutTooltip('Create New', 'Ctrl + N')}><Button variant="contained" color="primary" size="medium" onClick={handleOpenAdd} sx={btnNew}>+ New</Button></Tooltip>
        </Stack>
      }
    >
      <BOSDataTable columns={columns} rows={paginatedRows} page={page} size={size} totalCount={filteredRows.length} loading={loading} onPageChange={setPage} onSizeChange={(s) => { setSize(s); setPage(0); }} onDoubleClickRow={handleOpenEdit} onEditRow={handleOpenEdit} onDeleteRow={handleDeleteClick} />
      <AddYourEntityDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
      <ConfirmDeleteDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={handleDeleteConfirm} title="Delete" message="Are you sure?" itemName={deleteTargetName} />
    </MainCard>
  );
}
```

### Step 4: Register Route

In `src/routes/MainRoutes.jsx`:
```jsx
// Add import at top
const YourEntityMaster = Loadable(lazy(() => import('views/your-module/YourEntityMaster')));

// Add route in children array
{ path: '/master/your-module', element: <YourEntityMaster /> },
```

### Step 5: Add Menu Item

In `src/menu-items/erp.js`, add inside the appropriate group's `children`:
```js
{
  id: 'master-your-module',
  title: 'Your Entity',
  type: 'item',
  url: '/master/your-module'
}
```

---

## 5. Component API Reference

### `BOSFormDialog`
| Prop | Type | Description |
|------|------|-------------|
| `open` | bool | Controls visibility |
| `onClose` | func | Called on close |
| `onSave` | func | Save handler (bound to Ctrl+S) |
| `onDelete` | func | Delete handler (bound to Ctrl+D) |
| `onClear` | func | Clear form handler |
| `onEditClick` | func | Switch from view to edit mode (Ctrl+E) |
| `title` | string | Dialog title |
| `isViewOnly` | bool | Read-only mode shows Edit/Close buttons |
| `hasId` | bool | If true + onDelete exists, shows Delete button |
| `maxWidth` | string | MUI maxWidth: `"sm"`, `"md"`, `"lg"` |
| `children` | node | Form content (BOSFormSection components) |

### `BOSFormSection`
| Prop | Type | Description |
|------|------|-------------|
| `icon` | node | Tabler icon element |
| `title` | string | Section header text |
| `children` | node | Form fields (BOSTextField components) |

### `BOSTextField`
| Prop | Type | Description |
|------|------|-------------|
| `maxLength` | number | Max character limit (SOP #10) |
| `required` | bool | Shows asterisk (*) (SOP #9) |
| `error` | bool | Error state |
| `helperText` | string | Validation message below field |
| All MUI TextField props are supported |

### `BOSDataTable`
| Prop | Type | Description |
|------|------|-------------|
| `columns` | array | `[{ id, label, minWidth, bold?, maxWidth? }]` |
| `rows` | array | Current page data |
| `page` | number | Current page index (0-based) |
| `size` | number | Rows per page |
| `totalCount` | number | Total row count for pagination |
| `loading` | bool | Shows loading state |
| `onPageChange` | func | `(newPage) => {}` |
| `onSizeChange` | func | `(newSize) => {}` |
| `onDoubleClickRow` | func | SOP #7: `(row) => {}` |
| `onEditRow` | func | Edit button click: `(row) => {}` |
| `onDeleteRow` | func | Delete button click: `(row) => {}` |
| `renderCell` | func | Custom: `(col, row, idx) => ReactNode` |

### `useBOSValidation` Hook
```js
const { errors, validate, clearErrors } = useBOSValidation();

// Rules format:
const rules = [
  { field: 'name', label: 'Name', required: true, maxLength: 100 },
  { field: 'email', label: 'Email', pattern: /^[^@]+@[^@]+$/, patternMessage: 'Invalid email' },
  { field: 'age', label: 'Age', type: 'number' },
  { field: 'code', label: 'Code', validate: (val, form) => val === form.otherField ? 'Must differ' : null }
];

const isValid = validate(formData, rules); // returns boolean, shows snackbar on error
```

### `useKeyboardShortcuts` Hook
```js
useKeyboardShortcuts({
  'ctrl+s': handleSave,
  'ctrl+e': handleEdit,
  'ctrl+d': handleDelete,
  'ctrl+n': handleNew,
  'ctrl+y': handleYes,
  'ctrl+enter': handleConfirm,
  'escape': handleClose
}, isEnabled);
```

### `shortcutTooltip(label, shortcut)`
```js
shortcutTooltip('Save', 'Ctrl + S')  // → "Save (Ctrl + S)"
```

### Snackbar Pattern
```js
import { openSnackbar } from 'store/slices/snackbar';

dispatch(openSnackbar({
  open: true,
  message: 'Your message here',
  variant: 'alert',
  alert: { variant: 'filled' },
  severity: 'success', // or 'error', 'warning', 'info'
  close: false
}));
```

---

## 6. Style Tokens (from `BOSStyles.js`)

Import via: `import { btnSave, btnExport, getBOSStyles } from 'ui-component/bos';`

| Token | Color | Usage |
|-------|-------|-------|
| `btnSave` | Green | Save buttons |
| `btnEdit(theme)` | Blue (primary) | Edit/New buttons |
| `btnDelete` | Red | Delete buttons |
| `btnCancel` | Gray | Cancel/Close buttons |
| `btnClear` | Secondary | Clear form buttons |
| `btnExport` | Outlined Primary | Export Excel buttons |
| `btnNew` | Contained Primary | "+ New" buttons |

---

## 7. ABSOLUTE RULES (Never Break These)

1. **NEVER use `window.confirm()`** — Always use `<ConfirmDeleteDialog />`
2. **NEVER use `alert()`** — Always use `dispatch(openSnackbar(...))`
3. **NEVER write inline `darkStyles` objects** — Always use `BOSStyles.js`
4. **NEVER build custom table markup** — Always use `<BOSDataTable />`
5. **NEVER build custom dialog chrome** — Always use `<BOSFormDialog />`
6. **NEVER skip keyboard shortcuts** — Every page needs `useKeyboardShortcuts`
7. **NEVER skip `setFilterConfig`** — Every list page must set + cleanup filters
8. **ALWAYS use `BOSTextField`** — Never raw `<TextField />` in BOS forms
9. **ALWAYS wrap in `<MainCard>`** — Every list page uses MainCard with title + secondary
10. **ALWAYS add Tooltip with shortcut hint** — On New, Save, Edit, Delete buttons

---

## 8. Existing Modules (Reference Implementations)

| Module | List Page | Dialog | API Endpoint |
|--------|-----------|--------|-------------|
| HR Department | `views/master/hr/DepartmentDetails.jsx` | `AddDepartmentDialog.jsx` | `/api/hrm/departments` |
| Audit Area | `views/qms/AuditAreaMaster/AuditAreaMaster.jsx` | `AddAuditAreaDialog.jsx` | `/api/master/qms/audit-area` |
| Audit Type | `views/qms/AuditTypeMaster/AuditTypeMaster.jsx` | `AddAuditTypeDialog.jsx` | `/api/master/qms/audit-type` |
| Audit Criteria | `views/qms/AuditCriteriaMaster/AuditCriteriaMaster.jsx` | `AddAuditCriteriaDialog.jsx` | `/api/master/qms/audit-criteria` |

**Best starting point**: Copy `AuditAreaMaster` (simplest) and modify.

---

## 9. Theme Integration

The Berry template provides the theme via `src/themes/index.jsx`. BOS components automatically adapt to:
- **Light/Dark mode** via `useColorScheme()` from MUI
- **Preset colors** via `config.js` → `presetColor`
- **Border radius** via `config.js` → `borderRadius: 8`
- **Font** via `config.js` → `fontFamily: 'Roboto'`

**DO NOT hardcode colors.** Use theme tokens: `theme.palette.primary.main`, `'success.main'`, `'error.main'`, etc.

---

## 10. Backend API Convention

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/master/{module}` | List all records |
| POST | `/api/master/{module}` | Create new record |
| PUT | `/api/master/{module}/{id}` | Update existing record |
| DELETE | `/api/master/{module}/{id}` | Delete record |

All controllers must have `@CrossOrigin(origins = "*")` during development.

---

*Document Version: 1.0 — Last Updated: 2026-05-07*
*Maintainer: Nutech Autonoma System Pvt Ltd*
