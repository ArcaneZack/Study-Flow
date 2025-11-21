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

function doActivity(type) {
  const boost = ENERGY_BOOSTS[type] || 0;
  state.energy = Math.min(100, state.energy + boost);
  updateEnergyDisplay();
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