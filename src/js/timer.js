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
    state.totalMinutes += getCurrentMode().work / 60;
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

  clearInterval(state.energyInterval);

  // Switch between work and break
  state.isBreak = !state.isBreak;
  state.time = state.isBreak ? getCurrentMode().break : getCurrentMode().work;
  state.startTime = null;
  state.pausedTime = null;

  updateTimerDisplay();
  updateGoalProgress();

  // Auto-start breaks if enabled
  if (state.autoStartBreaks && state.isBreak) {
    setTimeout(() => {
      if (!state.isRunning) {
        toggleTimer();
      }
    }, 1000);
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