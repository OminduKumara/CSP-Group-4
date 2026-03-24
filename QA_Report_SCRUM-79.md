# QA Test Report: SCRUM-79 (Registration Workflow)

**Tester:** Lead QA\
**Date:** March 24, 2026\
**Environment:** Local Development (Azure DB Connected)\
**Status:** ✅ Manual Testing Complete | 1 Bug Found & Resolved

## Executive Summary
Executed manual testing for the Registration Workflow. Discovered a critical backend bug during the initial Happy Path test (TC-79.1) where the database query used MySQL syntax instead of Microsoft SQL syntax. The bug was fixed, and a re-test (TC-79.1.2) passed successfully. All negative paths passed validation as expected.

## Test Execution Log

| Test ID | Scenario | Pre-Conditions | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-79.1** | **Happy Path:** Successful Registration | Backend running, Database connected. |User is successfully registered and routed to the /dashboard (or sees a "Pending Approval" success message). | The system failed to register the user. A red UI error box appeared stating: `'LAST_INSERT_ID' is not a recognized built-in function name.` | ❌ FAIL |
| **TC-79.1.2** | **Happy Path:** Successful Registration (Post-Fix) | Backend running, Database connected. | User is successfully registered and routed to the /dashboard (or sees a "Pending Approval" success message). | Matched expected result. | ✅ PASS |
| **TC-79.2** | **Negative Path:** Duplicate Email | An account with test@sliit.lk already exists in the DB.| The system prevents registration and displays an error message (e.g., "Email already in use"). | Matched expected result. | ✅ PASS  |
| **TC-79.3** | **Negative Path:** Missing Required Fields | None. | The form does not submit. UI shows a validation error under the Username field. | Matched expected result. | ✅ PASS |
| **TC-79.4** | **Negative Path:** Weak Password | None. | Registration fails. UI shows a warning about password requirements. | Matched expected result. | ✅ PASS |
