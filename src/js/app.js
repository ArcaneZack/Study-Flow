// ===== MAIN APP =====

function initApp() {
  // Cache DOM elements
  cacheElements();
  
  // Load saved data
  loadData();
  
  // Update custom mode label
  DEFAULT_MODES.custom.label = `Custom (${state.customWorkTime}/${state.customBreakTime})`;
  
  // Setup event listeners
  setupEventListeners();
  
  // Request notification permission
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
  
  // Initial UI render
  updateModeSelectOptions();
  renderCategoryOptions();
  updateTimerDisplay();
  updateStartButton();
  updateEnergyDisplay();
  updateGoalProgress();
  renderTasks();
  applyTheme();
  updateSettingsUI();
  showRandomQuote();
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