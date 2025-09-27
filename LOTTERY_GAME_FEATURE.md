# Lottery Game Feature Documentation

## Overview

The Lottery Game feature provides an interactive, animated gaming experience for conducting prize draws. This feature includes smooth animations, real-time winner selection, and a beautiful user interface that creates an engaging lottery experience.

## Features

### 🎰 Game Management
- **Start Game**: Initialize a lottery game with all configured prizes
- **Draw Winners**: Animated winner selection with spinning effects
- **Next Prize**: Progress through multiple prizes sequentially
- **Game Completion**: Automatic detection when all prizes are drawn

### 🎨 Visual Elements
- **Smooth Animations**: Powered by Framer Motion for fluid transitions
- **Prize Display**: Beautiful prize cards with images and type indicators
- **Winner Announcement**: Celebratory winner reveal with user details
- **Progress Tracking**: Real-time display of remaining and drawn prizes
- **Status Indicators**: Visual feedback for game state and prize types

### 🎯 Prize Types
- **💰 Money Prizes**: Monetary rewards for winners
- **🎁 Item Prizes**: Physical items or products
- **Mixed Games**: Support for games with both prize types

## API Endpoints

### Start Game
```
POST {{BASE_URL}}/game-api/games/{gameId}/start/
```
**Response:**
```json
{
  "game": {
    "id": 11,
    "store": 1,
    "name": "ТЕСТ2",
    "description": "ТЕСТ2ssdasdasd",
    "status": "draft",
    "all_clients": false,
    "from_bonus": null,
    "to_bonus": null,
    "eligible_clients_count": 0,
    "prizes": [...]
  },
  "current_prize": {
    "id": 27,
    "name": "ТЕСТОВЫЙ",
    "type": "item",
    "image": "https://turan.easybonus.uz/media2/prizes/cargo_jHfnwkK.jpg"
  },
  "participating_clients_count": 3
}
```

### Draw Winner
```
POST {{BASE_URL}}/game-api/games/{gameId}/draw/
```
**Response:**
```json
{
  "winner": {
    "store_client_id": 2,
    "full_name": "JAMSHIDTEST",
    "phone_number": "+998971234567",
    "total_bonuses": 2
  },
  "current_prize": {
    "id": 28,
    "name": "ТЕСТОВЫЙ_2",
    "type": "money",
    "image": "https://turan.easybonus.uz/media2/prizes/benzi_SRxxM6N.png"
  }
}
```

### Next Prize
```
POST {{BASE_URL}}/game-api/games/{gameId}/next/
```
**Response:**
```json
{
  "current_prize": {
    "id": 28,
    "name": "ТЕСТОВЫЙ_2",
    "type": "money",
    "image": "https://turan.easybonus.uz/media2/prizes/benzi_SRxxM6N.png"
  }
}
```

## User Interface

### Games List View
The main games page displays all available games with:
- **Game Cards**: Enhanced card layout showing game details
- **Prize Preview**: Visual preview of available prizes
- **Status Indicators**: Game status (draft, active, completed, paused)
- **Action Buttons**: Start Game, Edit, Delete buttons
- **Store Information**: For super admins, shows associated store

### Lottery Game Interface
When a game is started, a full-screen modal appears with:
- **Gradient Background**: Beautiful purple-to-blue gradient
- **Prize Display**: Large circular prize display with image
- **Animation Effects**: Spinning animations during draws
- **Winner Announcement**: Celebratory winner reveal
- **Progress Indicators**: Shows remaining and drawn prizes
- **Control Buttons**: Draw Winner, Next Prize, Game Complete

## Game Flow

### 1. Game Initialization
```
User clicks "Start Game" → API call to /start/ → Game data loaded → Interface displayed
```

### 2. Prize Draw Cycle
```
Show current prize → User clicks "Draw Winner" → 3-second animation → Winner revealed → Show "Next Prize" button
```

### 3. Game Progression
```
User clicks "Next Prize" → API call to /next/ → New prize loaded → Repeat draw cycle
```

### 4. Game Completion
```
All prizes drawn → "Game Complete" button shown → User returns to games list
```

## Technical Implementation

### Components
- **LotteryGame.tsx**: Main lottery game interface component
- **Enhanced games.tsx**: Updated games list with lottery functionality

### State Management
- **gameData**: Complete game information from start API
- **currentPrize**: Currently active prize being drawn
- **winner**: Current winner information
- **drawnPrizes**: Array of already drawn prize IDs
- **gameStarted**: Boolean indicating if game is active
- **isDrawing**: Animation state for draw process
- **showWinner**: Controls winner display visibility

### Animations
- **Entrance**: Scale and opacity animations for modals
- **Prize Rotation**: Continuous spinning during draw
- **Winner Reveal**: Scale and position animations
- **Transitions**: Smooth state changes between prizes

### Error Handling
- **API Failures**: Toast notifications for all API errors
- **Validation**: Prevents starting games without prizes
- **State Recovery**: Graceful handling of network issues

## Styling

### Color Scheme
- **Primary Gradient**: Purple to pink for main actions
- **Background**: Purple to blue gradient for game interface
- **Success**: Green gradients for winner announcements
- **Secondary**: Blue gradients for progression actions

### Responsive Design
- **Mobile Friendly**: Responsive layouts for all screen sizes
- **Touch Interactions**: Optimized for touch devices
- **Accessibility**: Keyboard navigation support

## Dependencies

### Required Packages
```json
{
  "framer-motion": "^10.x.x",
  "react": "^19.x.x",
  "@tanstack/react-query": "^5.x.x",
  "sonner": "^2.x.x"
}
```

### API Client
- Axios-based API client with authentication
- Error interceptors for token refresh
- Type-safe API hooks using React Query

## Usage Examples

### Starting a Game
```tsx
import { LotteryGame } from '../components/LotteryGame';

const [selectedGameId, setSelectedGameId] = useState<number | null>(null);

// In JSX:
{selectedGameId && (
  <LotteryGame
    gameId={selectedGameId}
    onClose={() => setSelectedGameId(null)}
  />
)}
```

### Game Status Display
```tsx
const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  paused: "bg-yellow-100 text-yellow-800",
};
```

## Best Practices

### Performance
- **Lazy Loading**: Game interface only loads when needed
- **Animation Optimization**: Hardware-accelerated animations
- **Image Optimization**: Proper image sizing and loading

### User Experience
- **Visual Feedback**: Clear indicators for all states
- **Error Recovery**: Graceful error handling with user-friendly messages
- **Accessibility**: Screen reader support and keyboard navigation

### Security
- **API Authentication**: Bearer token authentication for all requests
- **Input Validation**: Client and server-side validation
- **Error Sanitization**: Safe error message display

## Future Enhancements

### Planned Features
- **Sound Effects**: Audio feedback for draws and wins
- **Custom Animations**: Configurable animation themes
- **Game Templates**: Pre-built game configurations
- **Analytics**: Draw statistics and winner tracking
- **Multi-language**: Full internationalization support

### Technical Improvements
- **Offline Support**: Service worker for offline functionality
- **Real-time Updates**: WebSocket support for live games
- **Performance Metrics**: Analytics for game performance
- **A/B Testing**: Feature flag system for experiments

## Troubleshooting

### Common Issues
1. **Game Won't Start**: Ensure game has prizes configured
2. **Animation Stuttering**: Check device performance and browser compatibility
3. **API Errors**: Verify network connection and authentication tokens
4. **Display Issues**: Ensure proper CSS and responsive design support

### Debug Tips
- Check browser console for JavaScript errors
- Verify API responses in Network tab
- Test with different screen sizes and orientations
- Validate game data structure matches API specification