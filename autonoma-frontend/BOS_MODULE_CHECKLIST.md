# Autonoma BOS — AI-Ready Development Checklist

## For Every New Module, Verify:

### List Page Checklist
- [ ] Wrapped in `<MainCard title={...} secondary={...}>`
- [ ] Uses `<BOSDataTable>` (not custom table markup)
- [ ] Has `btnExport` styled Export Excel button
- [ ] Has `btnNew` styled "+ New" button with `Ctrl+N` tooltip
- [ ] `useEffect` sets `setFilterConfig` and cleans up on unmount
- [ ] `useKeyboardShortcuts` registered for `ctrl+n` and `escape`
- [ ] `useMemo` filtering against `globalQuery` and `globalFilters`
- [ ] `ConfirmDeleteDialog` for delete (not `window.confirm`)
- [ ] `openSnackbar` for success/error feedback
- [ ] Pagination via `page`/`size` state

### Dialog Checklist
- [ ] Uses `<BOSFormDialog>` wrapper (not raw `<Dialog>`)
- [ ] Uses `<BOSFormSection>` for each card section
- [ ] Uses `<BOSTextField>` for all inputs
- [ ] Uses `useBOSValidation` with rules array
- [ ] Has `INITIAL_STATE` and `VALIDATION_RULES` constants
- [ ] `ConfirmDeleteDialog` for delete from within dialog
- [ ] `useEffect` resets form on open/initialData change
- [ ] Proper `isViewOnly` toggle logic
- [ ] Keyboard shortcuts via BOSFormDialog (auto-registered)
- [ ] Snackbar feedback for save/delete success/error

### Backend Checklist
- [ ] Entity with `@Entity`, `@Table`, `@Id`, `@GeneratedValue`
- [ ] Repository extends `JpaRepository`
- [ ] Controller with `@RestController`, `@RequestMapping`, `@CrossOrigin`
- [ ] Standard CRUD: GET all, POST create, PUT update, DELETE by id
- [ ] Standard fields: id, status, createdBy, createdDate, updatedBy, updatedDate

### Wiring Checklist
- [ ] Route added in `MainRoutes.jsx` children array
- [ ] Menu item added in `menu-items/erp.js`
- [ ] Lazy import with `Loadable(lazy(() => import(...)))`

## 5. Execution & Verification Workflow (BOS Pattern)
- [ ] Uses `ExecutionVerifyDialog` pattern for dual reporting/auditing
- [ ] "Samples" vs "Actual" dual-layer document display
- [ ] `filename|details` pipe-separated metadata for attachments
- [ ] Automatic `Pending for Verified` routing if `Dual Check` is enabled
- [ ] One-click upload (no separate "Add" button for documents)
- [ ] `parseFile` helper used in all galleries to handle server strings
- [ ] Remarks/Comments persisted directly to the Assignment record
