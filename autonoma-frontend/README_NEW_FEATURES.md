# Autonoma ERP — New Features & Module Guide

This document provides detailed instructions on how to use the newly implemented modules and features in the Autonoma ERP system.

## 1. User Administration & Management
**Location:** `Admin -> User Credentials`

### Features:
- **Centralized User List**: View all system users and their linked employee profiles.
- **Employee Linking**: New users must be linked to an existing employee record from the HRM Master.
- **Role Detection**: The system automatically identifies if a user is a **BOS Admin** based on their employee level.
- **Smart Refresh**: The list automatically synchronizes with the Employee Master to ensure name/code parity.
- **Security**: Displays "Account Status" (Active/Suspended) with clear visual indicators.

### How to use:
1. Click **+ Add User** to create a new credential.
2. Search for an employee by name or code in the dropdown.
3. Set a secure password and upload a profile picture if desired.
4. Use the **Manual Refresh** button (top right) if you've recently updated the Employee Master.

---

## 2. QMS Meeting Schedule (Recurring Logic)
**Location:** `QMS -> Meeting Schedule`

### Features:
- **Mandatory Subjects**: Ensures every meeting has a clear context for audit compliance.
- **Automated Recurrence**: Supports **DAILY** and **WEEKLY** scheduling.
- **Smart Weekday Derivation**: Automatically detects the weekday from the selected date and pre-populates the recurrence settings.
- **Backend Scheduler**: A daily background task (running at 4:00 AM) automatically generates the next meeting instance based on your frequency settings.

### How to use:
1. Create a new schedule and select **Frequency: WEEKLY**.
2. Pick a **Meeting Date**; the system will automatically set the corresponding **Weekday**.
3. The **Meeting Scheduler** will now automatically create future instances (e.g., every Monday) without manual input.

---

## 3. Global UI Improvements (BOS Standards)
- **Enhanced DataTables**: All tables now support custom cell rendering (Avatars, Status Chips, Action Icons).
- **Auto-Refresh**: Data-entry dialogs now trigger a deep refresh of the underlying list upon successful save.
- **Responsive Wraps**: Implemented a 15-character text wrapping strategy for long data strings to prevent table layout breakage.

---

## Technical Note for Developers
- **Backend**: The `MeetingSchedulerService` handles background processing. Ensure Spring's `@EnableScheduling` is active.
- **Frontend**: All new modules use the `BOSDataTable` and `BOSFormDialog` components for SOP compliance.
