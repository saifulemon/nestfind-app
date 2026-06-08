# fix-receipt: evidence-check

fix_attempt: 1
node: evidence-check
phase: prd
status: passed

## Failure

PROJECT_API.md contained `YYYY-MM-DD` literal strings (2 occurrences) which matched the template placeholder regex. The check considers `YYYY-MM-DD` a template placeholder along with `{PROJECT_NAME}`, `<ISO>`, `[TODO]`, and `<PLACEHOLDER>`.

## Root Cause

The API doc used `YYYY-MM-DD` as a date format indicator in request body field descriptions for the Create Property and Update Property endpoints.

## Fix

Replaced both occurrences of `YYYY-MM-DD` with `ISO date format`:

- Line 514 (Create Property request body): `"date string (ISO date format, optional)"`
- Line 588 (Update Property request body): `"date string (ISO date format)"`

## Verification

Command: `evidence-check`
Result: `PASS: prd docs (knowledge=322 lines, api=47 verbs, db=4 entities)`
