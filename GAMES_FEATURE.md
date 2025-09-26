# Games Feature Documentation

## Overview

A complete game management system that allows creating and managing promotional games with role-based access control.

## Features

### 🎮 Game Creation
- Create games with name, description, start date, and end date
- Automatic store assignment based on user role
- Date validation to ensure end date is after start date

### 👤 Role-Based Access Control

#### Superadmin
- Can see and manage **ALL** games across all stores
- **Must select** a store when creating a game
- Can view games from any store in the games list

#### Store Admin
- Can only see and manage games for **their assigned store**
- Store is **automatically assigned** when creating a game (no selection needed)
- Games list is filtered to show only their store's games

### 📊 Games Management
- View all games with status indicators (Upcoming, Active, Ended)
- Edit existing games
- Delete games
- Search functionality
- Responsive table view

## API Integration

### Endpoints Used
```
POST /game-api/games/    - Create new game
GET  /game-api/games/    - List games
PUT  /game-api/games/{id}/ - Update game
DELETE /game-api/games/{id}/ - Delete game
```

### Game Data Structure
```json
{
  "id": 1,
  "store": 1,
  "name": "New Year Game",
  "description": "Win laptops and phones!",
  "start_date": "2025-12-25T10:00:00Z",
  "end_date": "2025-12-31T23:59:59Z",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z",
  "store_read": {
    "id": 1,
    "name": "Main Store",
    "address": "123 Main St"
  }
}
```

## File Structure

```
src/core/
├── api/
│   ├── game.ts          # Game API hooks
│   └── types.ts         # Game interface definition
├── pages/
│   ├── create-game.tsx  # Game creation form
│   └── games.tsx        # Games list and management
└── layout/
    └── layout.tsx       # Navigation with Games link
```

## Navigation

Added "Games" menu item in the settings submenu with Trophy icon.

## User Experience

### For Superadmin
1. Navigate to Games → Create Game
2. Select store from dropdown
3. Fill in game details
4. View all games across stores

### For Store Admin
1. Navigate to Games → Create Game
2. Store is auto-selected (shows: "Creating game for: [Store Name]")
3. Fill in game details
4. View only games for their store

## Security Features

- Store-based data isolation
- Role-based UI rendering
- Automatic store assignment prevention
- Unauthorized access protection

## Error Handling

- Date validation with user-friendly messages
- Network error handling
- Permission-based error messages
- Form validation feedback

## Responsive Design

- Mobile-friendly forms
- Responsive table layout
- Touch-friendly buttons
- Optimized for all screen sizes