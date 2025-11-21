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