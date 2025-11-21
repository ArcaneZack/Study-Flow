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

  // Audio
  customAlarm: null,
  customAlarmName: '',

  // UI
  currentPage: 'home'
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