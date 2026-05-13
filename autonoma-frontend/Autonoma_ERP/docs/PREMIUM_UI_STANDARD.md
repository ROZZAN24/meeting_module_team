# Autonoma ERP Premium UI Standard

This document establishes the **absolute standard** for form interfaces, dialogs, and data entry modules across the Autonoma ERP system. All future and refactored UI components **MUST** adhere to this structural and stylistic template without deviation.

## Reference Code Template
A fully working, reusable React component has been created for developers to copy-paste:
👉 `src/ui-component/templates/PremiumFormDialogTemplate.jsx`

## Core UI Requirements

### 1. Dialog Configuration
- **Sizing:** Dialogs must always use `maxWidth="lg"` and `fullWidth={true}`.
- **Backdrop:** Must use the blurred backdrop configuration: 
  `sx={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}`
- **Paper:** Must enforce a consistent border radius (`24px`), dynamic shadow, and specific background coloring for light/dark mode compatibility.

### 2. Layout Structure (CSS Grid)
- **Side-by-Side Design:** The primary layout must use CSS Grid, enforcing a rigid side-by-side structure:
  `gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }`
- **Left Column (`2fr`):** Reserved exclusively for core form sections (Data Entry, Timeline, Execution, SOP).
- **Right Column (`1fr`):** Reserved exclusively for supplemental interactions (File Uploads, Camera Scanning, Document Previews).

### 3. Form Sections & Inputs
- **Cards:** Each logical grouping of data must be wrapped in an elevated `Box` with a `16px` border radius, divider border, and a header containing an icon and title.
- **Input Stacking:** All internal inputs **MUST** be placed inside a vertical `<Stack spacing={2.5}>`.
- **Full Width:** All `TextField`, `Select`, and `DatePicker` components must have the `fullWidth` prop.
- **Styling (`darkStyles.input`):** All inputs must be forced to take 100% width by overriding Material UI's internal padding behavior:
  `sx={{ ...darkStyles.input, width: '100% !important' }}`

### 4. Action Buttons & Footer
The footer uses a strict positioning rule that cannot be altered:
- **Left Side:** Destructive and reset actions ONLY (Delete [Red], Clear [Yellow/Grey]).
- **Right Side:** Primary progression actions ONLY (Save [Green], Edit [Primary Blue]).
- **Buttons:** Must use the predefined `darkStyles` objects (`btnSave`, `btnClear`, `btnInactive`) which include hover effects, transformations, and strict border radii (`24px`).

## Usage
Whenever a new module (e.g., Audit Type, Employee Entry, Product Creation) requires a dialog, developers should duplicate `PremiumFormDialogTemplate.jsx` and substitute the generic form elements with the necessary business logic fields. 

Do not alter the spacing, colors, or structural breakpoints.

### 5. Master List Pages & Action Buttons
- **Top Right Actions:** All master list pages (e.g., QMS and HR lists) must have their primary actions placed in the `secondary` prop of the `MainCard` component.
- **Button Order & Position:** The strict visual order MUST be: `[Export Excel]` followed by `[+ New]`. They must not be interchanged.
- **Export Excel Button:** 
  - Variant: `outlined` | Color: `primary` | Size: `medium`
  - Icon: `<IconFileDownload size={18} />`
  - Styling: `borderRadius: '8px'`, `textTransform: 'none'`, `fontWeight: 600`, `borderWidth: '2px'` with corresponding hover states (`borderWidth: '2px'`, `bgcolor: 'primary.50'`).
- **+ New Button:**
  - Variant: `contained` | Color: `primary` | Size: `medium`
  - Styling: `borderRadius: '8px'`, `textTransform: 'none'`, `fontWeight: 600`, `boxShadow: 2`. 
  - Animation: MUST include `transition: 'all 0.2s'` and `transform: 'translateY(-2px)'` on hover for the floating animation effect (do not use heavy `AnimateButton` wrappers).
