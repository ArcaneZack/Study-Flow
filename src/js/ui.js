// ===== UI RENDERING =====

// DOM Elements (populated in init)
let elements = {};

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
    html += `
      <button onclick="doActivity('${activity.id}')" class="rounded-lg p-2 text-xs transition-colors relative group" style="background-color: ${activity.color}30; color: ${activity.color};">
        ${activity.name}
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
  
  list.innerHTML = state.customActivities.map(activity => `
    <div class="flex items-center justify-between bg-slate-700 rounded-lg p-2">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded" style="background-color: ${activity.color};"></div>
        <span class="text-white text-sm">${activity.name}</span>
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
    return `
      <div class="flex items-center gap-2 p-2 rounded-lg ${task.done ? 'bg-slate-700/50' : 'bg-slate-700'}">
        <button onclick="toggleTask(${task.id})" class="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'}">
          ${task.done ? '<svg class="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>' : ''}
        </button>
        <span class="w-2 h-2 rounded-full flex-shrink-0" style="background: ${PRIORITY_COLORS[task.priority]};"></span>
        <span class="px-1.5 py-0.5 rounded text-xs flex-shrink-0" style="background: ${category.color}20; color: ${category.color};">${category.name}</span>
        <span class="flex-1 text-xs ${task.done ? 'text-slate-500 line-through' : 'text-white'}">${task.text}</span>
        <button onclick="deleteTask(${task.id})" class="p-1 hover:bg-slate-600 rounded flex-shrink-0">
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