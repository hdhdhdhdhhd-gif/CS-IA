# NeuroPlanner - Energy-Based Task Management

## Overview

NeuroPlanner is a tablet-optimized web application designed to help busy individuals (particularly parents working from home) plan their daily tasks intelligently based on their current energy levels. The app uses a pure client-side architecture with no backend dependencies, automatically ordering tasks by energy compatibility and priority to optimize productivity throughout the day.

## Recent Changes (October 2025)

**Data Persistence Fix**:
- Added proper cache control headers via custom Python server to prevent browser caching issues
- Enhanced LocalStorage debugging with console logging
- Fixed history rendering to populate on initialization when data exists
- Reorganized file structure (CSS/JS moved to assets/ folder for better organization)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: Pure vanilla JavaScript, HTML5, and CSS3 with no frameworks or build tools required.

**Rationale**: Chosen for simplicity, zero dependencies, immediate execution, and easy maintenance. The application runs directly in the browser without compilation or bundling steps.

**Core Design Patterns**:
- **State Management**: Centralized `appState` object holds all application data (tasks, history, current energy, daily rating)
- **Persistence Layer**: LocalStorage provides client-side data persistence using a single JSON blob (`neuroPlannerData`)
- **Event-Driven UI**: DOM manipulation driven by user interactions with immediate visual feedback

**UI/UX Decisions**:
- **Tablet-First Design**: Large touch targets (buttons/inputs), generous spacing, and responsive layout optimized for iPad usage
- **Color Scheme**: Calm beige/white backgrounds with light blue/green accents to reduce cognitive load and create a soothing experience
- **Visual Hierarchy**: Energy input at top, ordered task list in middle, task creation at bottom follows natural workflow progression

### Data Architecture

**Data Structure**:
```javascript
{
  tasks: [],        // Active tasks with id, name, category, energy, priority
  history: [],      // Completed tasks with completion dates
  currentEnergy: null,  // User's daily energy level (1-5)
  dailyRating: null     // User's feedback rating (1-5 stars)
}
```

**Storage Strategy**: 
- Single-key LocalStorage approach storing entire app state as JSON
- Automatic save on every state mutation
- Load on initialization to restore previous session

**Rationale**: LocalStorage provides sufficient persistence for personal task management without backend complexity. JSON serialization keeps data structure simple and portable.

### Task Ordering Algorithm

**Multi-Factor Sorting**:
1. **Primary Sort**: Energy compatibility (tasks matching current energy level appear first)
2. **Secondary Sort**: Priority level (1 = highest priority)

**Rationale**: Matches tasks to user's available energy first, then prioritizes within that energy band. This prevents high-priority but high-energy tasks from appearing when user has low energy.

### Category System

**Predefined Categories**: 
- 🍳 Cooking
- 🧹 Cleaning  
- 💪 Gym
- 📄 Paperwork
- 📌 Other

**Rationale**: Fixed categories simplify UI and match the primary user's (parent working from home) common task types. Extensible through "Other" category.

### Form Validation

**Client-Side Validation**:
- Required fields: Task name, category, energy level
- Optional field: Priority
- Prevents empty submissions with user-friendly alerts

**Rationale**: Immediate feedback prevents data integrity issues and improves user experience by catching errors before state mutation.

### History Tracking

**Completion Flow**:
- "Mark as Done" action moves task from active list to history
- Completion date automatically captured
- Historical tasks preserved indefinitely in LocalStorage

**Rationale**: Provides accountability and progress tracking without cluttering active task list.

### Feedback System

**Daily Rating**: 1-5 star rating for plan efficiency stored in app state.

**Rationale**: Enables user to track which energy assessments and task orderings work best over time.

## External Dependencies

### Browser APIs
- **LocalStorage API**: Client-side data persistence
- **DOM APIs**: Direct manipulation for UI updates
- **Date API**: Timestamp generation for task IDs and completion dates

### Third-Party Services
None. The application is completely self-contained with no external API calls, authentication services, or cloud dependencies.

### Hosting Requirements
- Static file server (any HTTP server capable of serving HTML/CSS/JS)
- Currently configured to run on port 5000
- No build process or compilation required

### Browser Compatibility
- Modern browsers with ES6+ support
- LocalStorage API support (available in all modern browsers)
- CSS Grid and Flexbox support for layout
