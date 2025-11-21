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
                   style="height: ${Math.max(sessionHeight, 4)}%"
                   title="${day.sessions} sessions"></div>
              <div class="flex-1 bg-cyan-500 rounded-t transition-all" 
                   style="height: ${Math.max(minuteHeight, 4)}%"
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