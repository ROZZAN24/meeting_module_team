# Autonoma ERP: BOS UI Gold Standard Guide
**Version 2.0 (Stable)** | **Standardized: 2026-05-13**

This document defines the absolute template for all Master Modules and Transaction Dialogs. Any new page must follow this structure to maintain professional ERP consistency.

---

## 1. The "Canonical" Reference Module
**Path:** `src/views/qms/checklist/AddCheckListDialog.jsx`
*Refer to this file whenever building a new Master Dialog.*

---

## 2. Universal Page Structure (The 70/30 Split)
Every main dialog must use the **Split-Pane Sidebar Pattern**:

### Left Pane (70% - Data Entry)
- Group fields into `BOSFormSection`.
- Use `display: grid` with 2 columns for high density.
- Fields must use the `errorStyle(errors.field)` for high-fidelity animations.

### Right Pane (30% - Sticky Audit Sidebar)
- **Top**: `Audit Info` card (System ID, Status, Created By).
- **Middle**: `Rejection Note` (conditional error highlight).
- **Bottom**: `Standard Attachments` (Mandatory).

---

## 3. Mandatory Document Management Template
All attachments MUST be implemented using the **BOS Ecosystem**:

```javascript
import { BOSFileUpload } from 'ui-component/bos';

<BOSFileUpload
  label="Standard Attachments"
  files={formData.attachments}
  onChange={(newFiles) => setFormData({ ...formData, attachments: newFiles })}
  module="YOUR_MODULE_CODE" // e.g. QMS_CHECKLIST, SALES_ENQUIRY
  multiple={true}
  helperText="PDFs, Images, or Excel sheets"
/>
```

### Features included in this template:
- **Middle-Truncation**: Filenames like `Very_Long_Name...123.pdf` are handled automatically.
- **Eye Button (Slideshow Mode)**: Users can cycle through multiple files without closing the preview.
- **Glassmorphic Preview**: High-fidelity blurred header with print and navigation controls.
- **Mac Path Compatibility**: Backend automatically maps to `~/BOS_DOCUMENTS` for development.

---

## 4. Professional Validation Pattern
Never use `window.confirm`. Always use the standard error pattern:

1.  **State**: `const [errors, setErrors] = useState({});`
2.  **Logic**: `setErrors(newErrors);`
3.  **UI**:
    ```javascript
    <BOSTextField
      required
      label="Document Reference"
      name="docRef"
      value={formData.docRef}
      onChange={handleChange}
      error={!!errors.docRef}
      sx={errorStyle(errors.docRef)} // Elastic shake animation
    />
    ```

---

## 5. Deployment Checklist
When standardizing a page, ensure:
- [ ] Sidebar contains `Audit Info` and `BOSFileUpload`.
- [ ] All inputs use `errorStyle`.
- [ ] Save button uses `loading` state.
- [ ] Date fields use `Effective From` (no past dates) and `Carry Forward` logic.
- [ ] Eye button preview is verified (Scrollable, Printable).
