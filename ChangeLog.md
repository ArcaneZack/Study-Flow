# Changelog

All notable changes to Study Flow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2026-07-16

### Added
- **Performance Optimizations**: 
  - Added `v8-compile-cache` to significantly reduce main process startup time
  - Asynchronous font loading to prevent render-blocking network requests
  - Bundled JS files to reduce IPC overhead on bootup
  - Added CSS `will-change` GPU compositing hints to timer and progress bars for smoother animation
- **Vector App Icon**: Completely redesigned the app icon using a programmatic SVG renderer for true transparency and flawless vector edges

### Changed
- Refactored `initApp` to defer non-critical UI rendering via `requestIdleCallback`, prioritizing first paint speed
- Updated window initialization to show the dark background instantly instead of hanging on `ready-to-show`
- Replaced CDN-based Tailwind runtime with a locally bundled CSS file for security and offline support

### Fixed
- **Content Security Policy (CSP)**: Eliminated unsafe external script loading errors
- **Chromium Cache Errors**: Fixed persistent terminal pollution (`cache_util_win.cc Access is denied`) by redirecting `userData` away from roaming profiles, eagerly wiping stale caches, and explicitly disabling Chromium HTTP/GPU caches

## [1.2.0] - 2025-11-21

### Added
- **Custom Energy Activities**: Users can now create their own recovery activities with custom names, energy boost amounts (1-50%), and colors
- **Toggle Default Activities**: Option to hide default energy activities (Break, Exercise, Meditate, Snack) and only show custom ones
- **Color Picker for Activities**: Choose custom colors for each energy recovery activity
- **Activity Color Display**: Energy buttons now display in their assigned colors on home page
- Hover-to-delete functionality for custom energy activities
- Activity management list in settings showing all custom activities with color indicators

### Changed
- Energy activities section now dynamically renders based on user preferences
- Custom activities are saved to localStorage and persist between sessions
- Energy button grid now adapts to show only enabled activities

## [1.1.5] - 2025-11-21

### Added
- **Custom Timer Lengths**: Set your own work and break durations in settings
- Custom mode now updates label to show current custom times
- Input validation for custom timer lengths (1-120 min for work, 1-60 min for break)

### Changed
- Timer modes now include "Custom" option with user-defined durations
- Custom timer settings saved to localStorage

## [1.1.4] - 2025-11-21

### Added
- **Auto-start Breaks**: Toggle option in settings to automatically start break timer after focus session completes
- Auto-start delay of 1 second before break begins
- Toggle switch UI for auto-start setting

### Changed
- Timer completion now checks auto-start setting before requiring manual start

## [1.1.3] - 2025-11-21

### Added
- **Task Categories**: Group tasks by subject with color-coded labels
- Default categories: General, Math, Science, History, Language, Art
- **Custom Categories**: Create your own task categories with custom names and colors
- Category management interface in settings
- Category color picker
- Category display on each task item

### Changed
- Task input now includes category selector dropdown
- Tasks display category badge with custom color
- Tasks can be filtered and organized by category

## [1.1.2] - 2025-11-21

### Added
- **Statistics Page**: New dedicated page for viewing study analytics
- **Weekly Bar Chart**: Visual chart showing sessions and minutes for last 7 days
- Weekly totals: Total sessions and minutes across the week
- Average session length calculation
- Best day indicator showing which day had the most sessions
- Navigation button to access stats page (chart icon in header)
- Keyboard shortcut `T` to open statistics page

### Changed
- Weekly stats now stored in localStorage
- Stats automatically roll over to new week
- Chart dynamically scales based on data

## [1.1.1] - 2025-11-21

### Added
- **Task Priorities**: Assign High, Medium, or Low priority to tasks
- Priority color indicators (Red for High, Yellow for Medium, Green for Low)
- Priority selector dropdown when adding tasks
- Tasks automatically sorted by priority (High → Medium → Low, then by completion status)

### Changed
- Task list now displays priority dots with color coding
- Completed tasks appear at bottom regardless of priority

## [1.1.0] - 2025-11-21

### Added
- **Session Goals**: Set daily session goals (1-20 sessions)
- Visual progress bar showing goal completion
- Progress bar turns green when goal is reached
- Goal setting input in Today's Progress card
- **Session Notes**: Add notes about accomplishments after completing each session
- Note modal appears after session completion
- Session notes saved to localStorage
- Skip option for session notes
- **Break Suggestions**: Random helpful tips displayed during break time
- 8 different break tip messages
- Tips automatically hide when timer resumes
- **Focus Quotes**: Motivational quotes displayed in header
- 9 different inspirational quotes
- Random quote shown on app launch
- **Export Data**: Download all user data as JSON file
- Export includes tasks, categories, stats, settings, and session notes
- Export button in settings with download functionality
- Filename includes export date

### Changed
- UI now shows goal progress dynamically
- Session completion triggers note modal
- Break time displays helpful suggestions

## [1.0.5] - 2025-11-21

### Added
- **Keyboard Shortcuts System**:
  - `Space` - Play/Pause timer
  - `R` - Reset timer
  - `S` - Open settings
  - `Esc` - Return to home page
- Keyboard shortcuts reference in settings page
- Keyboard hint text below timer controls
- Event listener to handle all keyboard inputs

### Changed
- Shortcuts only work when not typing in input fields
- Settings page now shows all available shortcuts

## [1.0.4] - 2025-11-21

### Added
- **Confirm Before Close**: Warning dialog if timer is running when closing the app
- Browser `beforeunload` event handler
- Warning message: "Timer is still running. Are you sure you want to leave?"

### Changed
- App will now prompt before closing if work is in progress
- Prevents accidental data loss

## [1.0.3] - 2025-11-21

### Added
- **Volume Control**: Slider to adjust alarm volume (0-100%)
- Volume display showing current percentage
- Volume setting saved to localStorage
- Test alarm button respects volume setting

### Changed
- All alarm sounds now use user-selected volume
- Default volume set to 70%

## [1.0.2] - 2025-11-21

### Added
- **Modular Code Structure**: Refactored entire codebase into separate modules
  - `constants.js` - Configuration constants and defaults
  - `state.js` - State management and localStorage operations
  - `timer.js` - All timer-related logic
  - `tasks.js` - Task and category management
  - `energy.js` - Energy tracking and recovery
  - `settings.js` - Settings management and theme
  - `stats.js` - Statistics calculations and chart rendering
  - `ui.js` - All UI rendering functions
  - `app.js` - Event listeners and initialization
- File structure documentation in README
- Separation of concerns for better maintainability

### Changed
- Single large HTML file split into modular JavaScript files
- All functions now properly scoped to their modules
- Improved code organization and readability

## [1.0.1] - 2025-11-20

### Added
- **Improved Timer Accuracy**: Timer now uses `Date.now()` for precise countdown
- **Continuous Energy Drain**: Energy depletes gradually (1% per minute) while working instead of chunk depletion
- Energy drain interval (0.5% every 30 seconds)
- Pause functionality preserves exact remaining time

### Changed
- Timer updates every 100ms instead of 1000ms for smoother display
- Timer calculation based on elapsed real time instead of tick counting
- Energy system feels more realistic with gradual drain

### Fixed
- Timer no longer feels slower than real seconds
- Timer doesn't drift over long sessions
- Pausing and resuming maintains accurate time

## [1.0.0] - 2025-11-20

### Added
- **Core Timer Functionality**:
  - Pomodoro mode (25 min work / 5 min break)
  - Deep Work mode (50 min work / 10 min break)
  - Short Sprint mode (15 min work / 3 min break)
  - Circular progress ring visualization
  - Timer display with MM:SS format
  - Start/pause toggle button
  - Reset button
  - Mode selector dropdown
- **Energy/Burnout Tracking**:
  - Energy bar starting at 100%
  - Energy percentage display
  - Status indicators: Fresh (70-100%), Good (40-69%), Tired (20-39%), Burnout Risk (<20%)
  - Color-coded energy bar (Green → Blue → Yellow → Red)
  - Four default recovery activities:
    - Break (+10% energy)
    - Exercise (+15% energy)
    - Meditate (+20% energy)
    - Snack (+5% energy)
  - Burnout warning message when energy drops below 20%
- **Task Management**:
  - Add new tasks with text input
  - Task list display
  - Mark tasks as complete with checkbox
  - Delete tasks
  - Strike-through styling for completed tasks
  - Empty state message
- **Daily Statistics**:
  - Session counter (number of completed focus sessions)
  - Total minutes studied today
  - Stats display in card format
  - Purple/cyan color scheme for stats
- **Settings Page**:
  - Navigation between home and settings
  - Settings button in header
  - Back button to return home
  - **Dark/Light Mode**:
    - Toggle switch for theme
    - Dark mode (default)
    - Light mode with adjusted colors
    - Theme preference saved to localStorage
  - **Custom Alarm Sound**:
    - File upload for MP3, WAV, OGG formats
    - Display of current alarm name
    - Test button to preview alarm
    - Reset button to restore default alarm
    - Default beep sound included
- **Desktop Notifications**:
  - Notification permission request on first launch
  - "Session Complete! Time for a break!" notification
  - "Break Over! Ready to focus again?" notification (in v1.0.1)
  - Browser notification API integration
- **Data Persistence**:
  - LocalStorage implementation for all user data
  - Automatic saving on changes
  - Data restoration on app launch
  - Daily stats that reset at midnight
  - Persistent tasks across sessions
  - Saved theme preference
  - Saved session goal
- **UI/UX Design**:
  - Gradient card backgrounds (slate-800 to slate-900)
  - Rounded corners and shadows
  - Smooth transitions and animations
  - Progress ring animation
  - Hover effects on buttons
  - Color-coded status indicators
  - Responsive grid layout (2 columns)
  - Header with app title and tagline
  - Settings gear icon
- **Window Scaling**:
  - Responsive timer that scales with window size
  - Minimum and maximum size constraints
  - Proper text sizing at different resolutions

### Changed
- Initial release - no previous changes

### Fixed
- Initial release - no previous bugs

## [0.0.3] - 2025-11-19

### Added
- Electron window configuration
- Main process setup in `main.js`
- Window dimensions set to 900x700
- Menu bar hidden for cleaner interface
- App icon support (when icon file provided)

### Changed
- Switched from browser-based to Electron desktop app
- Updated build configuration for desktop

## [0.0.2] - 2025-11-19

### Added
- Tailwind CSS integration via CDN
- Basic HTML structure with placeholder content
- CSS styling foundation
- Light/dark mode CSS variables

### Changed
- Replaced basic CSS with Tailwind utility classes

## [0.0.1] - 2025-11-19

### Added
- Initial project setup
- Git repository initialization
- `package.json` creation with project metadata
- Electron framework installation
- Basic project folder structure
- `.gitignore` file for Node.js and Electron projects
- MIT License
- Repository created on GitHub

---

## Version History Summary

| Version | Date | Key Features |
|---------|------|-------------|
| 1.2.1 | 2026-07-16 | Startup performance optimizations, cache error fixes, vector app icon, CSP enforcement |
| 1.2.0 | 2025-11-21 | Custom energy activities with colors, toggle defaults |
| 1.1.5 | 2025-11-21 | Custom timer lengths |
| 1.1.4 | 2025-11-21 | Auto-start breaks |
| 1.1.3 | 2025-11-21 | Task categories with custom colors |
| 1.1.2 | 2025-11-21 | Statistics page with weekly chart |
| 1.1.1 | 2025-11-21 | Task priorities |
| 1.1.0 | 2025-11-21 | Session goals, notes, quotes, export data |
| 1.0.5 | 2025-11-21 | Keyboard shortcuts |
| 1.0.4 | 2025-11-21 | Confirm before close |
| 1.0.3 | 2025-11-21 | Volume control |
| 1.0.2 | 2025-11-21 | Modular code structure |
| 1.0.1 | 2025-11-20 | Improved timer accuracy, continuous energy drain |
| 1.0.0 | 2025-11-20 | Core timer, energy, tasks, settings, notifications |
| 0.0.3 | 2025-11-19 | Electron window setup |
| 0.0.2 | 2025-11-19 | Tailwind CSS integration |
| 0.0.1 | 2025-11-19 | Initial project setup |

---

## Upgrade Notes

### From 1.2.0 to 1.2.1
- The app now operates with a strict Content Security Policy (CSP) and relies on a locally bundled Tailwind CSS file instead of the CDN.
- Startup time is vastly improved due to JS bundling, async fonts, and V8 bytecode caching.
- Chromium HTTP/GPU disk caching is entirely disabled to prevent file locking bugs on Windows.
- No breaking changes or data migrations required.

### From 1.1.5 to 1.2.0
- Custom energy activities can now have colors via color picker
- Default activities (Break, Exercise, Meditate, Snack) can be hidden in settings
- New toggle in settings: "Show Default Activities"
- All existing custom activities will need colors set (defaults to blue)
- No breaking changes - all existing data is preserved

### From 1.1.4 to 1.1.5
- Custom timer mode now allows user-defined work and break lengths
- Settings page has new inputs for custom timer configuration
- Custom times are saved and persist between sessions
- No breaking changes

### From 1.1.3 to 1.1.4
- Auto-start breaks feature available in settings
- Toggle switch added to timer settings section
- No breaking changes - feature is opt-in

### From 1.1.2 to 1.1.3
- All tasks now require a category assignment
- Default category is "General" if none selected
- Existing tasks are automatically assigned to "General" category
- New category management interface in settings
- No data loss - all tasks preserved

### From 1.1.1 to 1.1.2
- New statistics page accessible via `T` key or chart icon
- Weekly stats stored in localStorage
- Historical data begins accumulating from this version forward
- No breaking changes

### From 1.1.0 to 1.1.1
- All tasks can now have priority levels
- Priority selector defaults to "Medium" for new tasks
- Existing tasks are assigned "Medium" priority automatically
- Task sorting now considers priority
- No breaking changes

### From 1.0.5 to 1.1.0
- Session notes modal appears after completing focus sessions
- Daily goal setting now available in Today's Progress
- Export functionality added to settings
- No breaking changes - all new opt-in features

### From 1.0.4 to 1.0.5
- Keyboard shortcuts now functional
- No settings migration needed
- No breaking changes

### From 1.0.3 to 1.0.4
- Close confirmation only appears if timer is running
- No settings changes
- No breaking changes

### From 1.0.2 to 1.0.3
- Volume setting added with 70% default
- Alarm sounds now respect volume setting
- No breaking changes

### From 1.0.1 to 1.0.2
- Code restructured into modules - affects development only
- If building from source, ensure all JS files in `src/js/` are present
- No user-facing changes
- No data migration needed

### From 1.0.0 to 1.0.1
- Timer accuracy improved significantly
- Energy drain is now gradual instead of per-session
- Energy will drain more noticeably during long sessions
- No breaking changes - all data preserved

### From 0.0.3 to 1.0.0
- First stable release with all core features
- Complete application functionality implemented
- All user data stored in localStorage
- No previous version data to migrate

### From 0.0.2 to 0.0.3
- Application now runs as desktop app via Electron
- No browser version available from this point forward

### From 0.0.1 to 0.0.2
- Tailwind CSS added for styling
- Basic UI structure implemented
- No functional changes yet