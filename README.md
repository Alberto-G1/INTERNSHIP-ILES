# INTERNSHIP-ILES
Internship-management-system

#  Install Required Packages

# Core dependencies
npm install axios react-router-dom

# UI Framework (Material UI)
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

# State management and data fetching
npm install @tanstack/react-query

# Form handling with validation
npm install react-hook-form @hookform/resolvers yup

# Date handling
npm install date-fns

# Notifications
npm install react-hot-toast


# Phase 3 Placement Module (Implemented)

The system now supports student-initiated placements with admin-controlled approval.

## Workflow

1. Student creates placement as Draft.
2. Student submits placement (Submitted + Pending).
3. Admin reviews and approves/rejects/cancels.
4. Approved placements can receive supervisor assignments.
5. Lifecycle state is date-aware: approved, active, completed.

## Dual Status Model

- Submission status: `draft`, `submitted`
- Approval status: `pending`, `approved`, `rejected`, `cancelled`

## Core Validations

- Placement letter required before submission.
- Placement letter must be PDF and <= 5MB.
- Start date must be before end date.
- Start date cannot be in the past at submission time.
- Minimum internship duration: 8 weeks.
- Student profile must be complete before submission.
- No overlap with other approved placements for the same student.
- Supervisors can only be assigned after approval.

## Backend Endpoints

### Student

- `GET /api/placements/student/`
- `POST /api/placements/student/`
- `GET /api/placements/student/{placement_id}/`
- `PATCH /api/placements/student/{placement_id}/`
- `POST /api/placements/student/{placement_id}/submit/`

### Admin

- `GET /api/placements/admin/`
- `POST /api/placements/admin/{placement_id}/decision/` (`approve`, `reject`, `cancel`)
- `PATCH /api/placements/admin/{placement_id}/supervisors/`
- `POST /api/placements/admin/lifecycle/refresh/`



