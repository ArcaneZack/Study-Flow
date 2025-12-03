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