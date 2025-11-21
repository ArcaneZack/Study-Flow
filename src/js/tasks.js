// ===== TASK MANAGEMENT =====

function addTask(text, priority = 'medium', categoryId = 'general') {
  if (!text.trim()) return;

  state.tasks.push({
    id: Date.now(),
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