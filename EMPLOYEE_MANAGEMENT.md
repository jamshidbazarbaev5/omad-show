# Employee Management System

This document describes the employee management functionality that has been added to the Omad Show application.

## Features

The employee management system allows different user roles to create and manage employees with role-based permissions:

### User Roles

1. **Superadmin** (`superadmin` or `is_superuser: true`)
   - Can create all role types: `superadmin`, `store_admin`, `seller`
   - Must specify a store when creating `store_admin` or `seller` roles
   - Can view and manage all employees across all stores

2. **Store Admin** (`store_admin`)
   - Can only create `seller` role
   - Automatically assigns sellers to their own store (no store selection needed)
   - Can only view and manage sellers from their own store

3. **Seller** (`seller`)
   - Cannot access employee management functionality

## API Endpoint

The employee management uses the following API endpoint:

```
POST {{BASE_URL}}/game-api/employees/
GET {{BASE_URL}}/game-api/employees/
PUT {{BASE_URL}}/game-api/employees/{id}/
DELETE {{BASE_URL}}/game-api/employees/{id}/
```

### Request Body for Creating Employee

```json
{
  "phone_number": "+998913869676",
  "full_name": "Employee Name",
  "role": "seller", // "superadmin", "store_admin", or "seller"
  "store": 1, // Required for superadmin when creating store_admin/seller; Auto-filled for store_admin
  "password": "password123"
}
```

## Pages

### 1. Employee List Page (`/employees`)

- **Route**: `/employees`
- **Component**: `EmployeesPage`
- **Features**:
  - View all employees (filtered by user permissions)
  - Search employees by full name
  - Edit employee information
  - Delete employees
  - Add new employees (redirects to create page)

#### Permissions:
- **Superadmin**: Can view, edit, and delete all employees
- **Store Admin**: Can only view, edit, and delete sellers from their store
- **Seller**: No access (redirects with unauthorized message)

### 2. Create Employee Page (`/create-employee`)

- **Route**: `/create-employee`
- **Component**: `CreateEmployeePage`
- **Features**:
  - Form to create new employees
  - Role-based field visibility
  - Store selection (for superadmin only)
  - Form validation

#### Form Fields:
- **Phone Number** (required)
- **Full Name** (required)
- **Role** (required, options depend on current user role)
- **Store** (visible only for superadmin, required for store_admin/seller roles)
- **Password** (required)

## Navigation

The employee management is accessible through the sidebar navigation under "Settings" → "Employees" for users with appropriate permissions.

## File Structure

```
src/core/
├── api/
│   ├── employee.ts          # Employee API hooks
│   └── types.ts             # Updated with Employee interface
├── pages/
│   ├── employees.tsx        # Employee list page
│   └── create-employee.tsx  # Create employee page
└── layout/
    └── layout.tsx           # Updated navigation with employees link
```

## Role-Based Business Logic

### Superadmin
- Can create any role type
- Must specify store for `store_admin` and `seller` roles
- Can manage all employees system-wide

### Store Admin
- Can only create `seller` role
- New sellers are automatically assigned to the store admin's store
- Can only see and manage sellers from their own store
- Cannot edit or delete employees with other roles

### Data Validation

1. **Store Requirement**: When creating `store_admin` or `seller` roles, a store must be specified (for superadmin) or auto-assigned (for store_admin)
2. **Permission Checks**: All operations check user permissions before allowing access
3. **Store Filtering**: Store admins can only see employees from their assigned store

## Error Handling

- Unauthorized access attempts show appropriate error messages
- Form validation prevents invalid submissions
- API errors are displayed to the user via toast notifications
- Users without proper permissions are redirected or shown access denied messages

## Usage Examples

### Creating a Seller (as Superadmin)
1. Navigate to `/employees`
2. Click "Add" button
3. Fill in phone number, full name
4. Select "Seller" role
5. Select target store
6. Enter password
7. Submit form

### Creating a Seller (as Store Admin)
1. Navigate to `/employees`
2. Click "Add" button
3. Fill in phone number, full name
4. Role is limited to "Seller" only
5. Store is automatically set to admin's store
6. Enter password
7. Submit form

## Translation Keys Used

The following translation keys are used throughout the employee management:

- `navigation.employees`
- `roles.superadmin`, `roles.store_admin`, `roles.seller`
- `forms.phone_number`, `forms.full_name`, `forms.role`, `forms.store`, `forms.password`
- `placeholders.enter_phone_number`, `placeholders.enter_full_name`, `placeholders.enter_password`, `placeholders.search_employee`
- `messages.success.created`, `messages.error.create`, `messages.error.unauthorized`, `messages.error.store_required`

Make sure these keys are added to your translation files for proper localization.