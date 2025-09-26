# Bonus Ranges Feature

This document describes the bonus ranges feature that has been implemented in the Omad Show application.

## Overview

The bonus ranges feature allows administrators to set up bonus point awards based on purchase amount ranges. This enables automatic bonus point calculations for customers based on their spending.

## API Endpoint

The feature connects to the following API endpoint:
- **Base URL**: `{{BASE_URL}}/game-api/bonus-ranges/`

## Data Structure

```json
{
  "store": 1,
  "min_amount": 100,
  "max_amount": 199,
  "bonus_points": 1
}
```

### Fields:
- `store`: Store ID (required for superadmin, automatically set for store admins)
- `min_amount`: Minimum purchase amount for this bonus range
- `max_amount`: Maximum purchase amount for this bonus range
- `bonus_points`: Number of bonus points awarded for purchases in this range

## User Permissions

### Superadmin (`role: "superadmin"`)
- Can view all bonus ranges across all stores
- Must select a store when creating/editing bonus ranges
- Can create, edit, and delete bonus ranges for any store

### Store Admin (`role: "store_admin"`)
- Can only view bonus ranges for their assigned store
- Store is automatically selected based on their assignment
- Can create, edit, and delete bonus ranges for their store only

## Features Implemented

### 1. Bonus Ranges Listing (`/bonus-ranges`)
- View all bonus ranges with pagination
- Filter by store (for superadmin)
- Edit and delete functionality
- Empty state with call-to-action

### 2. Create Bonus Range (`/bonus-ranges/create`)
- Form validation (max_amount must be greater than min_amount)
- Store selection for superadmin
- Automatic store assignment for store admins
- Default values: min_amount=100, max_amount=199, bonus_points=1

### 3. Edit Bonus Range (`/bonus-ranges/:id/edit`)
- Pre-populated form with existing data
- Same validation as create form
- Permission checking (users can only edit their store's ranges)

### 4. Navigation Menu
- Added "Bonus Ranges" section with DollarSign icon
- View and Create subsections
- Integrated with existing navigation system

## Files Added/Modified

### New Files:
- `src/core/api/bonus-range.ts` - API hooks
- `src/core/pages/bonus-ranges.tsx` - Listing page
- `src/core/pages/create-bonus-range.tsx` - Create page
- `src/core/pages/edit-bonus-range.tsx` - Edit page

### Modified Files:
- `src/core/api/types.ts` - Added BonusRange interface
- `src/core/layout/layout.tsx` - Added navigation menu items
- `src/App.tsx` - Added routes

## Type Definitions

```typescript
// User data structure (from API response)
export interface CurrentUser {
  id: number;
  phone_number: string;
  full_name: string;
  role: string;
  store: number;
}

// Bonus Range structure
export interface BonusRange {
  id?: number;
  store: number;
  min_amount: number;
  max_amount: number;
  bonus_points: number;
  store_read?: {
    id: number;
    name: string;
    address: string;
  };
}
```

## Routes Added

- `GET /bonus-ranges` - List bonus ranges
- `GET /bonus-ranges/create` - Create form
- `GET /bonus-ranges/:id/edit` - Edit form
- `POST /bonus-ranges` - Create bonus range (API)
- `PUT /bonus-ranges/:id` - Update bonus range (API)
- `DELETE /bonus-ranges/:id` - Delete bonus range (API)

## Validation Rules

1. `min_amount` must be greater than or equal to 0
2. `max_amount` must be greater than or equal to 0
3. `max_amount` must be greater than `min_amount`
4. `bonus_points` must be greater than or equal to 0
5. `store` is required (selected by superadmin or auto-assigned)

## Translation Keys

The following translation keys are used (with English fallbacks):
- `navigation.bonus_ranges`
- `navigation.viewBonusRanges`
- `navigation.createBonusRange`
- `forms.min_amount`
- `forms.max_amount`
- `forms.bonus_points`
- `messages.success.bonus_range_created`
- `messages.success.bonus_range_updated`
- `messages.error.create_bonus_range`
- `messages.error.update_bonus_range`
- `messages.error.invalid_amount_range`

## Usage Example

**Example user data from API:**
```json
{
    "id": 1,
    "phone_number": "+998994522958",
    "full_name": "a",
    "role": "superadmin",
    "store": 1
}
```

1. **Superadmin creates a bonus range:**
   - Navigate to `/bonus-ranges/create`
   - Select store from dropdown
   - Set min_amount: 100, max_amount: 199, bonus_points: 1
   - Submit form

2. **Store admin creates a bonus range:**
   - Navigate to `/bonus-ranges/create`
   - Store is automatically set to their assigned store ID
   - Set amount ranges and bonus points
   - Submit form

## Error Handling

- Form validation with real-time feedback
- API error handling with toast notifications
- Permission checks for cross-store access (store admins can only access their store's data)
- Loading states for better UX
- 404 handling for non-existent bonus ranges
- Role-based access control (only superadmin and store_admin can manage bonus ranges)

## Future Enhancements

Potential improvements for the bonus ranges feature:
1. Overlap detection between ranges
2. Bulk import/export functionality
3. Historical tracking of bonus range changes
4. Analytics dashboard for bonus point distribution
5. Advanced filtering and search capabilities