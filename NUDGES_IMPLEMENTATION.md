# Actionable Nudges Implementation

## Overview
Implemented a simple rules engine for generating actionable nudges based on journal patterns, with both backend analysis and mobile frontend display.

## Backend Implementation

### 1. Nudge Engine (`/backend/src/util/nudgeEngine.js`)
- **Simple Rules Engine**: Analyzes journal patterns to identify actionable insights
- **Nudge Types**:
  - `LOW_SENTIMENT_DAY`: Detects consistently low sentiment on specific days
  - `MISSING_ENTRIES`: Alerts when user hasn't journaled in 3+ days
  - `NEGATIVE_TREND`: Identifies declining mood patterns over time
  - `POSITIVE_MOMENTUM`: Celebrates improving mood trends
  - `WEEKEND_PATTERN`: Analyzes weekend vs weekday sentiment differences
  - `MORNING_VS_EVENING`: Identifies optimal journaling times

### 2. Analysis Functions
- `analyzeDayOfWeekPatterns()`: Detects day-of-week mood patterns
- `checkMissingEntries()`: Monitors journaling frequency
- `analyzeMoodTrends()`: Tracks recent mood changes
- `analyzeWeekendPatterns()`: Compares weekend vs weekday sentiment
- `analyzeTimeOfDayPatterns()`: Identifies morning vs evening patterns

### 3. API Endpoint
- **Route**: `GET /ai-insights/nudges`
- **Controller**: `getNudges()` in `insight.controller.js`
- **Authentication**: Requires valid JWT token
- **Response**: Returns up to 3 prioritized nudges per user

## Mobile Implementation

### 1. Store Integration (`/mobile/src/stores/ai-insight.store.ts`)
- Added `Nudge` interface with id, title, message, priority, action, generatedAt
- Added `nudges` array and `isNudgesLoading` state
- Added `fetchNudges()` function to call the API

### 2. NudgeCard Component (`/mobile/src/components/NudgeCard.tsx`)
- **Visual Design**: Card-based layout with priority indicators
- **Priority Colors**: High (red), Medium (amber), Low (green)
- **Action Icons**: Contextual icons based on action type
- **Interactive**: Tap to perform suggested actions

### 3. Dashboard Integration (`/mobile/src/screens/Dashboard.tsx`)
- **Section**: "Insights & Suggestions" prominently displayed
- **Loading State**: Shows spinner while fetching nudges
- **Action Handling**: Routes to appropriate screens based on nudge action
- **Auto-refresh**: Fetches nudges on dashboard load and refresh

## Nudge Actions & Navigation
- `journal_now` → Navigate to NewJournalEntry
- `plan_activity` → Navigate to NewGoal
- `self_care` → Navigate to Trends
- `celebrate` → Show toast message
- `plan_weekend` → Navigate to NewGoal
- `optimize_timing` → Show toast message

## Key Features
1. **Pattern Recognition**: Analyzes sentiment data to identify meaningful patterns
2. **Priority System**: High/Medium/Low priority with visual indicators
3. **Actionable**: Each nudge suggests specific user actions
4. **Personalized**: Based on individual user's journaling patterns
5. **Non-intrusive**: Only shows when patterns are detected
6. **Responsive**: Integrates seamlessly with existing dashboard

## Usage
1. Users journal regularly to build data
2. Backend analyzes patterns in sentiment and timing
3. When patterns are detected, nudges are generated
4. Mobile app fetches and displays nudges on dashboard
5. Users can tap nudges to take suggested actions

## Technical Notes
- Uses MongoDB aggregation for efficient pattern analysis
- Implements proper error handling and logging
- Follows existing code patterns and architecture
- No breaking changes to existing functionality
- Scalable design for adding new nudge types
