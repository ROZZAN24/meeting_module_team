# Autonoma ERP Premium UI Standard

This document establishes the **absolute standard** for form interfaces, dialogs, and data entry modules across the Autonoma ERP system. All future and refactored UI components **MUST** adhere to this structural and stylistic template without deviation.

## 🏆 The "Gold Standard" Template
A fully working, reusable React pattern has been established. All Master Dialogs must follow the logic found in:
👉 `src/views/qms/checklist/AddCheckListDialog.jsx`

## Core UI Requirements

### 1. Dialog Configuration & Split-Pane Layout
- **Sizing:** All Master Dialogs must use `maxWidth="lg"` and `fullWidth={true}`.
- **Structural Split:** Use the `sidebar` prop in `BOSFormDialog` to enforce a **70/30 split layout**.
  - **Left Column (Primary):** Core data entry grouped by `BOSFormSection`.
  - **Right Sidebar (Secondary):** System metadata (Audit Info), Attachments, and SOP Reminders.
- **Sticky Sidebar:** The sidebar must use `position: 'sticky'` to remain visible during long form scrolls.

### 2. High-Fidelity Validation Feedback (SOP #18)
Native `alert()` or `window.confirm()` calls are strictly forbidden. Use the following pattern:
- **Centralized Logic:** Use the `useBOSForm` hook to manage `formData` and `errors` state.
- **Elastic Shake Animation:** Validation failures **MUST** trigger the `bosShake` animation (refined 2px elastic movement).
- **Glow Pulse:** Fields with errors must maintain an infinite `bosPulse` (soft red glow) until the user corrects the input.
- **Implementation:**
  ```javascript
  <BOSTextField 
    required 
    error={errors.fieldName} 
    sx={errorStyle(errors.fieldName)} 
  />
  ```

### 3. Professional Sidebar Components
The right sidebar must contain standardized "Context Cards" using `Paper` with `12px` border-radius:
- **Audit Info:** Blue themed card (`primary.lighter`) showing System ID, Status, and Sync dates.
- **Assets/Files:** Grey themed card (`grey.50`) with a dashed-border upload zone and `BOSFileGallery`.
- **SOP Reminders:** Yellow/Amber themed card (`warning.lighter`) for critical compliance notes.

### 4. Action Buttons & Footer (SOP #1, #12)
The footer uses a strict positioning rule that cannot be altered:
- **Left Side:** Destructive and reset actions ONLY (Delete [Red], Clear [Yellow/Grey]).
- **Right Side:** Primary progression actions ONLY (Save [Green], Edit [Primary Blue]).
- **Secondary Actions:** Context-specific buttons (Verify [Success], Reject [Error]) should be passed via the `secondaryActions` prop.

### 5. Master List Pages & Action Buttons
- **Top Right Actions:** All master list pages must have their primary actions placed in the `secondary` prop of the `MainCard` component.
- **Button Order & Position:** The strict visual order MUST be: `[Export Excel]` followed by `[+ New]`. They must not be interchanged.
- **Animations:** All buttons MUST include a `transform: 'translateY(-2px)'` on hover for a floating effect.
