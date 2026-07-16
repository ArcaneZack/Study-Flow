// ===== CONSTANTS =====

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "Focus on being productive, not busy.",
  "Small progress is still progress.",
  "Your future self will thank you.",
  "One task at a time. One step at a time.",
  "Discipline is choosing what you want most over what you want now.",
  "You don't have to be great to start, but you have to start to be great.",
  "The only way to do great work is to love what you do.",
  "Success is the sum of small efforts repeated daily."
];

const BREAK_TIPS = [
  "Stretch your neck and shoulders",
  "Look at something 20 feet away for 20 seconds",
  "Take a few deep breaths",
  "Stand up and walk around",
  "Drink some water",
  "Rest your eyes - close them for a minute",
  "Do some light stretching",
  "Step outside for fresh air"
];

const DEFAULT_MODES = {
  pomodoro: { work: 25 * 60, break: 5 * 60, label: "Pomodoro (25/5)" },
  deepwork: { work: 50 * 60, break: 10 * 60, label: "Deep Work (50/10)" },
  short: { work: 15 * 60, break: 3 * 60, label: "Short Sprint (15/3)" },
  custom: { work: 25 * 60, break: 5 * 60, label: "Custom" }
};

const DEFAULT_CATEGORIES = [
  { id: "general", name: "General", color: "#8b5cf6" },
  { id: "math", name: "Math", color: "#ef4444" },
  { id: "science", name: "Science", color: "#22c55e" },
  { id: "history", name: "History", color: "#f59e0b" },
  { id: "language", name: "Language", color: "#3b82f6" },
  { id: "art", name: "Art", color: "#ec4899" }
];

const PRIORITY_COLORS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e"
};

const ENERGY_BOOSTS = {
  // Default activities removed - users create their own
};

const DEFAULT_SETTINGS = {
  darkMode: true,
  volume: 70,
  sessionGoal: 5,
  autoStartBreaks: false,
  customWorkTime: 25,
  customBreakTime: 5
};
// ===== STATE MANAGEMENT =====

const state = {
  // Timer
  mode: 'pomodoro',
  time: DEFAULT_MODES.pomodoro.work,
  isRunning: false,
  isBreak: false,
  interval: null,
  energyInterval: null,
  startTime: null,
  pausedTime: null,

  // Stats
  sessions: 0,
  totalMinutes: 0,
  energy: 100,
  sessionNotes: [],
  weeklyStats: [],

  // Tasks
  tasks: [],
  categories: [...DEFAULT_CATEGORIES],

  // Settings
  darkMode: DEFAULT_SETTINGS.darkMode,
  volume: DEFAULT_SETTINGS.volume,
  sessionGoal: DEFAULT_SETTINGS.sessionGoal,
  autoStartBreaks: DEFAULT_SETTINGS.autoStartBreaks,
  customWorkTime: DEFAULT_SETTINGS.customWorkTime,
  customBreakTime: DEFAULT_SETTINGS.customBreakTime,
  customActivities: [], // User-defined recovery activities

  // Audio
  customAlarm: null,
  customAlarmName: '',

  // UI
  currentPage: 'home',

  // FIX #8: Flag set by timerComplete() when autoStartBreaks is on.
  // Instead of firing a raw setTimeout that races with the note modal,
  // we set this flag and let hideNoteModal() check it after dismissal.
  pendingAutoStart: false
};

// ===== STORAGE FUNCTIONS =====

function saveData() {
  const data = {
    // Tasks
    tasks: state.tasks,
    categories: state.categories,

    // Today's stats
    sessions: state.sessions,
    totalMinutes: state.totalMinutes,
    sessionNotes: state.sessionNotes,

    // Weekly stats
    weeklyStats: state.weeklyStats,

    // Settings
    darkMode: state.darkMode,
    volume: state.volume,
    sessionGoal: state.sessionGoal,
    autoStartBreaks: state.autoStartBreaks,
    customWorkTime: state.customWorkTime,
    customBreakTime: state.customBreakTime,
    customActivities: state.customActivities,

    // Meta
    lastDate: new Date().toDateString()
  };
  localStorage.setItem('studyFlowData', JSON.stringify(data));
}

function loadData() {
  const saved = localStorage.getItem('studyFlowData');
  if (!saved) return;

  const data = JSON.parse(saved);
  const today = new Date().toDateString();

  // Check if it's a new day
  if (data.lastDate !== today) {
    // Save yesterday's stats to weekly
    if (data.lastDate) {
      addDayToWeeklyStats(data.lastDate, data.sessions || 0, data.totalMinutes || 0);
    }
    // Reset daily stats
    state.sessions = 0;
    state.totalMinutes = 0;
    state.sessionNotes = [];

    // FIX #7: Energy was never reset at midnight. A user who hit burnout (0%)
    // would start the next day still showing 0% with no recovery path.
    // Resetting to 100 on a new calendar day mirrors what sessions/minutes do.
    state.energy = 100;
  } else {
    // Same day - restore stats
    state.sessions = data.sessions || 0;
    state.totalMinutes = data.totalMinutes || 0;
    state.sessionNotes = data.sessionNotes || [];
  }

  // Always restore these
  state.tasks = data.tasks || [];
  state.categories = data.categories || [...DEFAULT_CATEGORIES];
  state.weeklyStats = data.weeklyStats || [];
  state.darkMode = data.darkMode !== undefined ? data.darkMode : DEFAULT_SETTINGS.darkMode;
  state.volume = data.volume !== undefined ? data.volume : DEFAULT_SETTINGS.volume;
  state.sessionGoal = data.sessionGoal || DEFAULT_SETTINGS.sessionGoal;
  state.autoStartBreaks = data.autoStartBreaks || DEFAULT_SETTINGS.autoStartBreaks;
  state.customWorkTime = data.customWorkTime || DEFAULT_SETTINGS.customWorkTime;
  state.customBreakTime = data.customBreakTime || DEFAULT_SETTINGS.customBreakTime;
  state.customActivities = data.customActivities || [];

  // Update custom mode with saved times
  DEFAULT_MODES.custom.work = state.customWorkTime * 60;
  DEFAULT_MODES.custom.break = state.customBreakTime * 60;
}

function addDayToWeeklyStats(dateString, sessions, minutes) {
  state.weeklyStats.push({
    date: dateString,
    sessions: sessions,
    minutes: minutes
  });

  // Keep only last 7 days
  if (state.weeklyStats.length > 7) {
    state.weeklyStats = state.weeklyStats.slice(-7);
  }

  saveData();
}

function getTodayStats() {
  return {
    date: new Date().toDateString(),
    sessions: state.sessions,
    minutes: state.totalMinutes
  };
}

function getWeeklyStatsWithToday() {
  const stats = [...state.weeklyStats];
  const today = getTodayStats();
  
  // Add today if not already in stats
  const todayIndex = stats.findIndex(s => s.date === today.date);
  if (todayIndex >= 0) {
    stats[todayIndex] = today;
  } else {
    stats.push(today);
  }

  return stats.slice(-7);
}
// ===== TIMER FUNCTIONS =====

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getCurrentMode() {
  return DEFAULT_MODES[state.mode];
}

function tick() {
  const now = Date.now();
  const elapsed = Math.floor((now - state.startTime) / 1000);
  const totalDuration = state.isBreak ? getCurrentMode().break : getCurrentMode().work;
  state.time = Math.max(0, totalDuration - elapsed);

  updateTimerDisplay();

  if (state.time <= 0) {
    timerComplete();
  }
}

function timerComplete() {
  clearInterval(state.interval);
  clearInterval(state.energyInterval);
  state.isRunning = false;
  updateStartButton();

  if (!state.isBreak) {
    // Focus session complete
    state.sessions++;

    // FIX #2: Work duration is stored in seconds (e.g. 1500 for 25 min).
    // Dividing by 60 without rounding can produce floats like 49.9999...
    // when floating-point precision drifts. Math.round() keeps the displayed
    // minutes whole and accurate.
    state.totalMinutes += Math.round(getCurrentMode().work / 60);

    updateEnergy();
    playAlarm();
    saveData();
    showNoteModal();
    
    if (Notification.permission === 'granted') {
      new Notification('Session Complete!', { body: 'Time for a break!' });
    }
    
    showBreakTip();
  } else {
    // Break complete
    hideBreakTip();
    
    if (Notification.permission === 'granted') {
      new Notification('Break Over!', { body: 'Ready to focus again?' });
    }
  }

  // FIX #1: The original code called clearInterval(state.energyInterval) AGAIN
  // here (after it was already cleared at the top of this function). That second
  // call was dead code — the interval ID is already invalid at this point.
  // Removed to avoid confusion about the control flow.

  // Switch between work and break
  state.isBreak = !state.isBreak;
  state.time = state.isBreak ? getCurrentMode().break : getCurrentMode().work;
  state.startTime = null;
  state.pausedTime = null;

  updateTimerDisplay();
  updateGoalProgress();

  // FIX #8: Auto-start break after focus session.
  // Previously this used a raw setTimeout(toggleTimer, 1000) which fired
  // unconditionally — even while the session-note modal was open. The user
  // could be mid-sentence in their note when the break started counting down.
  //
  // New approach: set a flag (state.pendingAutoStart). The modal's dismiss
  // handlers (hideNoteModal in ui.js) check this flag and only THEN start
  // the 1-second countdown. This guarantees the break never starts until
  // the user has dealt with the modal.
  if (state.autoStartBreaks && state.isBreak) {
    state.pendingAutoStart = true;
  }
}

function toggleTimer() {
  if (state.isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
  updateStartButton();
}

function startTimer() {
  const totalDuration = state.isBreak ? getCurrentMode().break : getCurrentMode().work;
  const remaining = state.pausedTime !== null ? state.pausedTime : state.time;
  state.startTime = Date.now() - ((totalDuration - remaining) * 1000);
  state.pausedTime = null;

  state.interval = setInterval(tick, 100);

  // Drain energy while working
  if (!state.isBreak) {
    state.energyInterval = setInterval(() => {
      if (state.energy > 0 && !state.isBreak) {
        state.energy = Math.max(0, state.energy - 0.5);
        updateEnergyDisplay();
      }
    }, 30000);
  }

  state.isRunning = true;
  hideBreakTip();
}

function pauseTimer() {
  clearInterval(state.interval);
  clearInterval(state.energyInterval);
  state.pausedTime = state.time;
  state.isRunning = false;
}

function resetTimer() {
  clearInterval(state.interval);
  clearInterval(state.energyInterval);
  state.isRunning = false;
  state.isBreak = false;
  state.time = getCurrentMode().work;
  state.startTime = null;
  state.pausedTime = null;
  hideBreakTip();
  updateTimerDisplay();
  updateStartButton();
}

function changeMode(newMode) {
  state.mode = newMode;
  resetTimer();
}

function updateCustomTimerLengths(workMinutes, breakMinutes) {
  state.customWorkTime = workMinutes;
  state.customBreakTime = breakMinutes;
  DEFAULT_MODES.custom.work = workMinutes * 60;
  DEFAULT_MODES.custom.break = breakMinutes * 60;
  
  if (state.mode === 'custom') {
    resetTimer();
  }
  
  saveData();
}
// ===== TASK MANAGEMENT =====

function addTask(text, priority = 'medium', categoryId = 'general') {
  if (!text.trim()) return;

  state.tasks.push({
    // FIX #4: Date.now() produces a millisecond timestamp. Two tasks added in
    // the same millisecond would get the same ID, causing toggleTask() and
    // deleteTask() to match both — silently corrupting the list.
    // crypto.randomUUID() is a browser/Node built-in that generates a random
    // 128-bit UUID, statistically guaranteed unique. No library needed.
    id: crypto.randomUUID(),
    text: text.trim(),
    done: false,
    priority: priority,
    category: categoryId,
    createdAt: new Date().toISOString()
  });

  renderTasks();
  saveData();
}

function toggleTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    renderTasks();
    saveData();
  }
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  renderTasks();
  saveData();
}

function getTasksByCategory(categoryId) {
  return state.tasks.filter(t => t.category === categoryId);
}

function getTasksSortedByPriority() {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...state.tasks].sort((a, b) => {
    // Sort by done status first (incomplete first)
    if (a.done !== b.done) return a.done ? 1 : -1;
    // Then by priority
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function getCategoryById(categoryId) {
  return state.categories.find(c => c.id === categoryId) || state.categories[0];
}

function getCategoryColor(categoryId) {
  const category = getCategoryById(categoryId);
  return category ? category.color : '#8b5cf6';
}

// ===== CATEGORY MANAGEMENT =====

function addCategory(name, color = '#8b5cf6') {
  const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  state.categories.push({
    id: id,
    name: name.trim(),
    color: color
  });
  saveData();
  renderCategoryOptions();
}

function deleteCategory(categoryId) {
  // Don't delete the default "General" category
  if (categoryId === 'general') return;

  // Move tasks in this category to "General"
  state.tasks.forEach(task => {
    if (task.category === categoryId) {
      task.category = 'general';
    }
  });

  state.categories = state.categories.filter(c => c.id !== categoryId);
  saveData();
  renderTasks();
  renderCategoryOptions();
}

function renderCategoryOptions() {
  const selects = document.querySelectorAll('.category-select');
  selects.forEach(select => {
    const currentValue = select.value;
    select.innerHTML = state.categories.map(cat => 
      `<option value="${cat.id}" ${cat.id === currentValue ? 'selected' : ''}>${cat.name}</option>`
    ).join('');
  });
}

// ===== SESSION NOTES =====

function addSessionNote(note) {
  if (!note.trim()) return;
  
  state.sessionNotes.push({
    time: new Date().toLocaleTimeString(),
    note: note.trim()
  });
  saveData();
}
// ===== ENERGY / BURNOUT TRACKING =====

function updateEnergy() {
  // Called when state.energy changes
  updateEnergyDisplay();
}

function getEnergyStatus() {
  if (state.energy >= 70) return { status: 'Fresh', color: 'green' };
  if (state.energy >= 40) return { status: 'Good', color: 'blue' };
  if (state.energy >= 20) return { status: 'Tired', color: 'yellow' };
  return { status: 'Burnout Risk!', color: 'red' };
}

function doActivity(activityKey) {
  // Check if it's a custom activity
  const customActivity = state.customActivities.find(a => a.id === activityKey);
  if (customActivity) {
    state.energy = Math.min(100, state.energy + customActivity.boost);
    updateEnergyDisplay();
  }
}

function drainEnergy(amount = 0.5) {
  state.energy = Math.max(0, state.energy - amount);
  updateEnergyDisplay();
}

function resetEnergy() {
  state.energy = 100;
  updateEnergyDisplay();
}

function isBurnoutRisk() {
  return state.energy < 20;
}

// ===== CUSTOM ACTIVITIES =====

function addCustomActivity(name, boost, color) {
  const id = 'custom-' + Date.now();
  state.customActivities.push({
    id: id,
    name: name.trim(),
    boost: Math.max(1, Math.min(50, boost)),
    color: color || '#3b82f6'
  });
  saveData();
  renderEnergyButtons();
  renderCustomActivitiesList();
}

function deleteCustomActivity(id) {
  state.customActivities = state.customActivities.filter(a => a.id !== id);
  saveData();
  renderEnergyButtons();
  renderCustomActivitiesList();
}
// ===== SETTINGS =====

// Theme
function toggleDarkMode() {
  state.darkMode = !state.darkMode;
  applyTheme();
  saveData();
}

function applyTheme() {
  document.body.classList.toggle('light-mode', !state.darkMode);
  updateThemeToggleUI();
}

// Volume
function setVolume(value) {
  state.volume = Math.max(0, Math.min(100, value));
  saveData();
}

function getVolume() {
  return state.volume / 100;
}

// Session Goal
function setSessionGoal(goal) {
  state.sessionGoal = Math.max(1, Math.min(20, goal));
  updateGoalProgress();
  saveData();
}

// Auto-start Breaks
function toggleAutoStartBreaks() {
  state.autoStartBreaks = !state.autoStartBreaks;
  saveData();
}

// Custom Timer
function setCustomWorkTime(minutes) {
  state.customWorkTime = Math.max(1, Math.min(120, minutes));
  DEFAULT_MODES.custom.work = state.customWorkTime * 60;
  DEFAULT_MODES.custom.label = `Custom (${state.customWorkTime}/${state.customBreakTime})`;
  updateModeSelectOptions();
  if (state.mode === 'custom') resetTimer();
  saveData();
}

function setCustomBreakTime(minutes) {
  state.customBreakTime = Math.max(1, Math.min(60, minutes));
  DEFAULT_MODES.custom.break = state.customBreakTime * 60;
  DEFAULT_MODES.custom.label = `Custom (${state.customWorkTime}/${state.customBreakTime})`;
  updateModeSelectOptions();
  if (state.mode === 'custom') resetTimer();
  saveData();
}

// Alarm
let customAlarmAudio = null;
const defaultAlarm = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAMBS67R7pNWBgdPweTlnGASBVvP8emQPwAAYtn39H8iABNn3/jnaggAKHXl+uVcCAA6g+r750UIAE2Q7/viMAAAbJ345FkAAIKp++BXAACcu//bPwAAsc7/1jAAAMTb/88fAADV6v/IEgAA4vb/wgAAAO////8AAAAAAA==');

function playAlarm() {
  const alarm = customAlarmAudio || defaultAlarm;
  alarm.volume = getVolume();
  alarm.currentTime = 0;
  alarm.play().catch(e => console.log('Audio play failed:', e));
}

function setCustomAlarm(file) {
  if (customAlarmAudio) {
    URL.revokeObjectURL(customAlarmAudio.src);
  }
  
  const url = URL.createObjectURL(file);
  customAlarmAudio = new Audio(url);
  state.customAlarmName = file.name;
  
  return file.name;
}

function resetAlarm() {
  if (customAlarmAudio) {
    URL.revokeObjectURL(customAlarmAudio.src);
    customAlarmAudio = null;
  }
  state.customAlarmName = '';
}

function getAlarmName() {
  // FIX #3: Audio blobs can't be serialized to localStorage. After a restart,
  // state.customAlarmName still holds the old filename, but customAlarmAudio
  // is null — so the app plays the default beep while *showing* the custom name.
  // This was silently misleading. Now we detect this mismatch and show a clear
  // warning so the user knows they need to re-upload their alarm file.
  if (state.customAlarmName && !customAlarmAudio) {
    return `⚠ Re-upload: ${state.customAlarmName}`;
  }
  return state.customAlarmName || 'Default alarm';
}

// Export Data
function exportData() {
  const exportData = {
    exportDate: new Date().toISOString(),
    tasks: state.tasks,
    categories: state.categories,
    todaySessions: state.sessions,
    todayMinutes: state.totalMinutes,
    sessionNotes: state.sessionNotes,
    weeklyStats: getWeeklyStatsWithToday(),
    sessionGoal: state.sessionGoal,
    settings: {
      darkMode: state.darkMode,
      volume: state.volume,
      autoStartBreaks: state.autoStartBreaks,
      customWorkTime: state.customWorkTime,
      customBreakTime: state.customBreakTime
    }
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `study-flow-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
// ===== STATISTICS =====

function renderStatsChart() {
  const stats = getWeeklyStatsWithToday();
  const chartContainer = document.getElementById('stats-chart');
  
  if (!chartContainer) return;
  
  // Find max values for scaling
  const maxSessions = Math.max(...stats.map(s => s.sessions), 1);
  const maxMinutes = Math.max(...stats.map(s => s.minutes), 1);
  
  // Generate day labels
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Pad stats to always show 7 days
  const paddedStats = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    const existing = stats.find(s => s.date === dateStr);
    paddedStats.push({
      date: dateStr,
      dayName: dayNames[date.getDay()],
      sessions: existing ? existing.sessions : 0,
      minutes: existing ? existing.minutes : 0,
      isToday: i === 0
    });
  }
  
  chartContainer.innerHTML = `
    <div class="flex justify-between items-end h-32 gap-2">
      ${paddedStats.map(day => {
        const sessionHeight = (day.sessions / maxSessions) * 100;
        const minuteHeight = (day.minutes / maxMinutes) * 100;
        return `
          <div class="flex-1 flex flex-col items-center gap-1">
            <div class="w-full flex gap-1 items-end h-24">
              <div class="flex-1 bg-purple-500 rounded-t transition-all" 
                   style="height: ${sessionHeight}%"
                   title="${day.sessions} sessions"></div>
              <div class="flex-1 bg-cyan-500 rounded-t transition-all" 
                   style="height: ${minuteHeight}%"
                   title="${day.minutes} minutes"></div>
            </div>
            <span class="text-xs ${day.isToday ? 'text-purple-400 font-bold' : 'text-slate-500'}">${day.dayName}</span>
          </div>
        `;
      }).join('')}
    </div>
    <div class="flex justify-center gap-4 mt-3">
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-purple-500 rounded"></div>
        <span class="text-xs text-slate-400">Sessions</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-cyan-500 rounded"></div>
        <span class="text-xs text-slate-400">Minutes</span>
      </div>
    </div>
  `;
}

function getWeeklyTotals() {
  const stats = getWeeklyStatsWithToday();
  return {
    sessions: stats.reduce((sum, s) => sum + s.sessions, 0),
    minutes: stats.reduce((sum, s) => sum + s.minutes, 0)
  };
}

function getAverageSessionLength() {
  const totals = getWeeklyTotals();
  if (totals.sessions === 0) return 0;
  return Math.round(totals.minutes / totals.sessions);
}

function getBestDay() {
  const stats = getWeeklyStatsWithToday();
  if (stats.length === 0) return null;
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const best = stats.reduce((max, s) => s.sessions > max.sessions ? s : max, stats[0]);
  const date = new Date(best.date);
  
  return {
    day: dayNames[date.getDay()],
    sessions: best.sessions,
    minutes: best.minutes
  };
}

function renderStatsPage() {
  const totals = getWeeklyTotals();
  const avgLength = getAverageSessionLength();
  const bestDay = getBestDay();
  
  // Update summary stats
  const weeklySessionsEl = document.getElementById('weekly-sessions');
  const weeklyMinutesEl = document.getElementById('weekly-minutes');
  const avgLengthEl = document.getElementById('avg-session-length');
  const bestDayEl = document.getElementById('best-day');
  
  if (weeklySessionsEl) weeklySessionsEl.textContent = totals.sessions;
  if (weeklyMinutesEl) weeklyMinutesEl.textContent = totals.minutes;
  if (avgLengthEl) avgLengthEl.textContent = avgLength + ' min';
  if (bestDayEl && bestDay) bestDayEl.textContent = bestDay.day;
  
  renderStatsChart();
}
// ===== UI RENDERING =====

// DOM Elements (populated in init)
let elements = {};

// ===== SECURITY: HTML SANITIZATION =====
// FIX #5: User-supplied strings (task names, activity names, etc.) were
// previously interpolated raw into innerHTML, creating an XSS vector.
// Any text like `<img src=x onerror=alert(1)>` would execute as HTML.
//
// escapeHtml() works by assigning the raw string to a div's textContent
// (which the browser stores as plain text, no parsing), then reading back
// innerHTML (which the browser auto-escapes). This converts:
//   < → &lt;    > → &gt;    " → &quot;    & → &amp;
// It is safe, zero-regex, and handles all edge cases the browser knows about.
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}


function cacheElements() {
  elements = {
    timerDisplay: document.getElementById('timer-display'),
    timerLabel: document.getElementById('timer-label'),
    progressRing: document.getElementById('progress-ring'),
    startBtn: document.getElementById('start-btn'),
    modeSelect: document.getElementById('mode-select'),
    sessionCount: document.getElementById('session-count'),
    totalMinutes: document.getElementById('total-minutes'),
    energyBar: document.getElementById('energy-bar'),
    energyStatus: document.getElementById('energy-status'),
    energyPercent: document.getElementById('energy-percent'),
    burnoutWarning: document.getElementById('burnout-warning'),
    taskList: document.getElementById('task-list'),
    taskInput: document.getElementById('task-input'),
    taskPriority: document.getElementById('task-priority'),
    taskCategory: document.getElementById('task-category'),
    quoteDisplay: document.getElementById('quote-display'),
    goalProgress: document.getElementById('goal-progress'),
    sessionGoalInput: document.getElementById('session-goal'),
    volumeSlider: document.getElementById('volume-slider'),
    volumeDisplay: document.getElementById('volume-display'),
    breakSuggestion: document.getElementById('break-suggestion'),
    breakTip: document.getElementById('break-tip'),
    noteModal: document.getElementById('note-modal'),
    sessionNote: document.getElementById('session-note'),
    alarmName: document.getElementById('alarm-name'),
    autoStartToggle: document.getElementById('auto-start-toggle'),
    customWorkInput: document.getElementById('custom-work-time'),
    customBreakInput: document.getElementById('custom-break-time')
  };
}

// ===== TIMER DISPLAY =====

function updateTimerDisplay() {
  if (!elements.timerDisplay) return;
  
  elements.timerDisplay.textContent = formatTime(state.time);
  
  const total = state.isBreak ? getCurrentMode().break : getCurrentMode().work;
  const progress = (state.time / total) * 553;
  elements.progressRing.style.strokeDashoffset = 553 - progress;
  elements.progressRing.style.stroke = state.isBreak ? '#f59e0b' : '#8b5cf6';
  
  elements.timerLabel.innerHTML = state.isBreak
    ? '<svg class="w-4 h-4 text-amber-400 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>Break Time'
    : '<svg class="w-4 h-4 text-purple-400 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>Focus Session';
  
  elements.sessionCount.textContent = state.sessions;
  elements.totalMinutes.textContent = state.totalMinutes;
}

function updateStartButton() {
  if (!elements.startBtn) return;
  
  elements.startBtn.innerHTML = state.isRunning
    ? '<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
    : '<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  
  elements.startBtn.className = `p-3 rounded-full transition-colors ${state.isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-purple-500 hover:bg-purple-600'}`;
}

function updateGoalProgress() {
  if (!elements.goalProgress) return;
  
  const progress = Math.min((state.sessions / state.sessionGoal) * 100, 100);
  elements.goalProgress.style.width = progress + '%';
  
  if (state.sessions >= state.sessionGoal) {
    elements.goalProgress.classList.remove('bg-purple-500');
    elements.goalProgress.classList.add('bg-green-500');
  } else {
    elements.goalProgress.classList.remove('bg-green-500');
    elements.goalProgress.classList.add('bg-purple-500');
  }
}

// ===== ENERGY DISPLAY =====

function updateEnergyDisplay() {
  if (!elements.energyBar) return;
  
  const status = getEnergyStatus();
  
  elements.energyBar.style.width = state.energy + '%';
  elements.energyPercent.textContent = Math.round(state.energy) + '%';
  elements.energyStatus.textContent = status.status;
  elements.energyStatus.className = `font-medium text-${status.color}-500 text-sm`;
  elements.energyBar.className = `h-full transition-all duration-500 bg-${status.color}-500`;
  
  elements.burnoutWarning.classList.toggle('hidden', !isBurnoutRisk());
}

function renderEnergyButtons() {
  const container = document.getElementById('energy-buttons');
  if (!container) return;
  
  let html = '';
  
  // Custom activities only
  state.customActivities.forEach(activity => {
    // FIX #5: Escape activity.name before inserting into innerHTML to prevent XSS.
    // FIX #4 (onclick): activity.id is now a timestamp string — wrap in single
    // quotes so the JS parser treats it as a string argument, not an expression.
    const safeName = escapeHtml(activity.name);
    html += `
      <button onclick="doActivity('${activity.id}')" class="rounded-lg p-2 text-xs transition-colors relative group" style="background-color: ${activity.color}30; color: ${activity.color};">
        ${safeName}
        <span class="absolute -top-1 -right-1 hidden group-hover:flex bg-red-500 text-white rounded-full w-4 h-4 text-xs items-center justify-center cursor-pointer" onclick="event.stopPropagation(); deleteCustomActivity('${activity.id}')">×</span>
      </button>
    `;
  });
  
  // Show message if no activities
  if (!html) {
    html = '<p class="text-slate-500 text-xs col-span-4 text-center py-2">No energy activities. Add one below!</p>';
  }
  
  container.innerHTML = html;
}

function renderCustomActivitiesList() {
  const list = document.getElementById('custom-activities-list');
  if (!list) return;
  
  if (state.customActivities.length === 0) {
    list.innerHTML = '<p class="text-slate-500 text-xs text-center py-2">No custom activities yet</p>';
    return;
  }
  
  // FIX #5: Escape activity.name before inserting into innerHTML.
  list.innerHTML = state.customActivities.map(activity => `
    <div class="flex items-center justify-between bg-slate-700 rounded-lg p-2">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded" style="background-color: ${activity.color};"></div>
        <span class="text-white text-sm">${escapeHtml(activity.name)}</span>
        <span class="text-slate-400 text-xs">+${activity.boost}%</span>
      </div>
      <button onclick="deleteCustomActivity('${activity.id}')" class="text-red-400 hover:text-red-300 text-xs">Delete</button>
    </div>
  `).join('');
}

// ===== TASKS DISPLAY =====

function renderTasks() {
  if (!elements.taskList) return;
  
  if (state.tasks.length === 0) {
    elements.taskList.innerHTML = '<p class="text-slate-500 text-xs text-center py-4">No tasks yet. Add one above!</p>';
    return;
  }
  
  const sortedTasks = getTasksSortedByPriority();
  
  elements.taskList.innerHTML = sortedTasks.map(task => {
    const category = getCategoryById(task.category);
    // FIX #5: Escape task.text (user input) before inserting into innerHTML.
    // A task named `<img src=x onerror=alert(1)>` would otherwise execute.
    const safeText = escapeHtml(task.text);
    const safeCategoryName = escapeHtml(category.name);

    // FIX #4 (onclick): task.id is now a UUID string. It must be wrapped in
    // single quotes inside the onclick attribute so JS parses it as a string
    // argument. Without quotes, `toggleTask(550e8400-e29b-...)` is parsed as
    // subtraction, which evaluates to NaN and never matches any task.
    return `
      <div class="flex items-center gap-2 p-2 rounded-lg ${task.done ? 'bg-slate-700/50' : 'bg-slate-700'}">
        <button onclick="toggleTask('${task.id}')" class="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'}">
          ${task.done ? '<svg class="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>' : ''}
        </button>
        <span class="w-2 h-2 rounded-full flex-shrink-0" style="background: ${PRIORITY_COLORS[task.priority]};"></span>
        <span class="px-1.5 py-0.5 rounded text-xs flex-shrink-0" style="background: ${category.color}20; color: ${category.color};">${safeCategoryName}</span>
        <span class="flex-1 text-xs ${task.done ? 'text-slate-500 line-through' : 'text-white'}">${safeText}</span>
        <button onclick="deleteTask('${task.id}')" class="p-1 hover:bg-slate-600 rounded flex-shrink-0">
          <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    `;
  }).join('');
}

// ===== BREAK TIPS =====

function showBreakTip() {
  if (!elements.breakSuggestion) return;
  
  const tip = BREAK_TIPS[Math.floor(Math.random() * BREAK_TIPS.length)];
  elements.breakTip.textContent = "💡 " + tip;
  elements.breakSuggestion.classList.remove('hidden');
}

function hideBreakTip() {
  if (!elements.breakSuggestion) return;
  elements.breakSuggestion.classList.add('hidden');
}

// ===== MODALS =====

function showNoteModal() {
  if (!elements.noteModal) return;
  elements.noteModal.classList.remove('hidden');
  elements.sessionNote.value = '';
  elements.sessionNote.focus();
}

function hideNoteModal() {
  if (!elements.noteModal) return;
  elements.noteModal.classList.add('hidden');

  // FIX #8 (modal side): Check if a break auto-start is pending.
  // timerComplete() sets state.pendingAutoStart instead of firing a raw
  // setTimeout, so the break countdown only begins HERE — after the user
  // has explicitly dismissed the modal. Without this, the break would
  // start while the user is still typing their session note.
  if (state.pendingAutoStart) {
    state.pendingAutoStart = false;
    setTimeout(() => {
      if (!state.isRunning) {
        toggleTimer();
      }
    }, 1000);
  }
}

// ===== PAGE NAVIGATION =====

function showPage(page) {
  state.currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page + '-page')?.classList.add('active');
  
  if (page === 'stats') {
    renderStatsPage();
  }
}

// ===== THEME =====

function updateThemeToggleUI() {
  const toggle = document.getElementById('theme-toggle');
  const dot = document.getElementById('theme-toggle-dot');
  const icon = document.getElementById('theme-icon');
  
  if (!toggle) return;
  
  if (state.darkMode) {
    toggle.classList.remove('bg-slate-500');
    toggle.classList.add('bg-purple-500');
    dot.style.transform = 'translateX(0)';
    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>';
  } else {
    toggle.classList.remove('bg-purple-500');
    toggle.classList.add('bg-slate-500');
    dot.style.transform = 'translateX(-24px)';
    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>';
  }
}

// ===== MODE SELECT =====

function updateModeSelectOptions() {
  if (!elements.modeSelect) return;
  
  elements.modeSelect.innerHTML = Object.entries(DEFAULT_MODES).map(([key, mode]) =>
    `<option value="${key}" ${key === state.mode ? 'selected' : ''}>${mode.label}</option>`
  ).join('');
}

// ===== SETTINGS UI =====

function updateSettingsUI() {
  if (elements.volumeSlider) {
    elements.volumeSlider.value = state.volume;
    elements.volumeDisplay.textContent = state.volume + '%';
  }
  
  if (elements.sessionGoalInput) {
    elements.sessionGoalInput.value = state.sessionGoal;
  }
  
  if (elements.alarmName) {
    elements.alarmName.textContent = getAlarmName();
  }
  
  if (elements.autoStartToggle) {
    updateAutoStartToggleUI();
  }
  
  if (elements.customWorkInput) {
    elements.customWorkInput.value = state.customWorkTime;
    elements.customBreakInput.value = state.customBreakTime;
  }
}

function updateAutoStartToggleUI() {
  const toggle = elements.autoStartToggle;
  const dot = document.getElementById('auto-start-dot');
  
  if (!toggle) return;
  
  if (state.autoStartBreaks) {
    toggle.classList.remove('bg-slate-500');
    toggle.classList.add('bg-purple-500');
    dot.style.transform = 'translateX(0)';
  } else {
    toggle.classList.remove('bg-purple-500');
    toggle.classList.add('bg-slate-500');
    dot.style.transform = 'translateX(-24px)';
  }
}

// ===== QUOTES =====

function showRandomQuote() {
  if (!elements.quoteDisplay) return;
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  elements.quoteDisplay.textContent = '"' + quote + '"';
}
// ===== MAIN APP =====

function initApp() {
  // Cache DOM elements
  cacheElements();

  // Load saved data from localStorage
  loadData();

  // Update custom mode label with saved times
  DEFAULT_MODES.custom.label = `Custom (${state.customWorkTime}/${state.customBreakTime})`;

  // ── CRITICAL PATH ────────────────────────────────────────────────────────
  // These run synchronously on DOMContentLoaded and determine what the user
  // sees on first paint. Keep this list as short as possible.
  applyTheme();           // body class must be set before paint or you get a flash
  updateTimerDisplay();   // timer face is the focal point — must be correct immediately
  updateStartButton();    // button state depends on isRunning
  updateModeSelectOptions(); // dropdown needs options before user can interact
  showRandomQuote();      // visible in header, render early
  // ─────────────────────────────────────────────────────────────────────────

  // Setup event listeners (no DOM mutations, just bindings — fast)
  setupEventListeners();

  // Request notification permission (async, no UI impact)
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // ── DEFERRED PATH ────────────────────────────────────────────────────────
  // These are below-the-fold or non-visible on first paint. Scheduling them
  // with requestIdleCallback lets the browser finish the critical render first,
  // then fills in the rest during idle time — eliminating startup stutter.
  requestIdleCallback(() => {
    renderCategoryOptions(); // populates task category dropdown
    updateEnergyDisplay();   // energy bar in right column
    updateGoalProgress();    // progress bar below timer
    renderTasks();           // task list (can be long)
    updateSettingsUI();      // settings page (hidden on load)
    renderEnergyButtons();   // custom activity buttons
  });
  // ─────────────────────────────────────────────────────────────────────────
}

function setupEventListeners() {
  // Timer controls
  elements.startBtn?.addEventListener('click', toggleTimer);
  document.getElementById('reset-btn')?.addEventListener('click', resetTimer);
  elements.modeSelect?.addEventListener('change', (e) => changeMode(e.target.value));
  
  // Task input
  elements.taskInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const text = elements.taskInput.value;
      const priority = elements.taskPriority?.value || 'medium';
      const category = elements.taskCategory?.value || 'general';
      addTask(text, priority, category);
      elements.taskInput.value = '';
    }
  });
  
  document.getElementById('add-task-btn')?.addEventListener('click', () => {
    const text = elements.taskInput.value;
    const priority = elements.taskPriority?.value || 'medium';
    const category = elements.taskCategory?.value || 'general';
    addTask(text, priority, category);
    elements.taskInput.value = '';
  });
  
  // Session goal
  elements.sessionGoalInput?.addEventListener('change', (e) => {
    setSessionGoal(parseInt(e.target.value) || 5);
  });
  
  // Navigation
  document.getElementById('settings-btn')?.addEventListener('click', () => showPage('settings'));
  document.getElementById('stats-btn')?.addEventListener('click', () => showPage('stats'));
  document.getElementById('back-btn')?.addEventListener('click', () => showPage('home'));
  document.getElementById('stats-back-btn')?.addEventListener('click', () => showPage('home'));
  
  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', toggleDarkMode);
  
  // Volume slider
  elements.volumeSlider?.addEventListener('input', (e) => {
    setVolume(parseInt(e.target.value));
    elements.volumeDisplay.textContent = state.volume + '%';
  });
  
  // Alarm upload
  document.getElementById('alarm-upload')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const name = setCustomAlarm(file);
      elements.alarmName.textContent = name;
    }
  });
  
  document.getElementById('test-alarm')?.addEventListener('click', playAlarm);
  
  document.getElementById('reset-alarm')?.addEventListener('click', () => {
    resetAlarm();
    elements.alarmName.textContent = 'Default alarm';
  });
  
  // Auto-start breaks toggle
  elements.autoStartToggle?.addEventListener('click', () => {
    toggleAutoStartBreaks();
    updateAutoStartToggleUI();
  });
  
  // Custom timer inputs
  elements.customWorkInput?.addEventListener('change', (e) => {
    setCustomWorkTime(parseInt(e.target.value) || 25);
  });
  
  elements.customBreakInput?.addEventListener('change', (e) => {
    setCustomBreakTime(parseInt(e.target.value) || 5);
  });
  
  // Export button
  document.getElementById('export-btn')?.addEventListener('click', exportData);
  
  // Note modal
  document.getElementById('skip-note-btn')?.addEventListener('click', hideNoteModal);
  document.getElementById('save-note-btn')?.addEventListener('click', () => {
    const note = elements.sessionNote?.value;
    if (note) addSessionNote(note);
    hideNoteModal();
  });
  
  // Category management
  document.getElementById('add-category-btn')?.addEventListener('click', () => {
    const name = document.getElementById('new-category-name')?.value;
    const color = document.getElementById('new-category-color')?.value || '#8b5cf6';
    if (name) {
      addCategory(name, color);
      document.getElementById('new-category-name').value = '';
    }
  });
  
  // Custom activity management (on home page)
  document.getElementById('add-activity-btn')?.addEventListener('click', () => {
    const name = document.getElementById('new-activity-name')?.value;
    const boost = parseInt(document.getElementById('new-activity-boost')?.value) || 10;
    const color = document.getElementById('new-activity-color')?.value || '#3b82f6';
    if (name) {
      addCustomActivity(name, boost, color);
      document.getElementById('new-activity-name').value = '';
      document.getElementById('new-activity-boost').value = '10';
      document.getElementById('new-activity-color').value = '#3b82f6';
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
  
  // Confirm before close
  window.addEventListener('beforeunload', (e) => {
    if (state.isRunning) {
      e.preventDefault();
      e.returnValue = 'Timer is still running. Are you sure you want to leave?';
      return e.returnValue;
    }
  });
}

function handleKeyboardShortcuts(e) {
  // Ignore if typing in input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  
  switch (e.code) {
    case 'Space':
      e.preventDefault();
      if (state.currentPage === 'home') toggleTimer();
      break;
    case 'KeyR':
      if (state.currentPage === 'home') resetTimer();
      break;
    case 'KeyS':
      showPage('settings');
      break;
    case 'KeyT':
      showPage('stats');
      break;
    case 'Escape':
      showPage('home');
      break;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
