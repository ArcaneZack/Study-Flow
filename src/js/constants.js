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
  break: 10,
  exercise: 15,
  meditate: 20,
  snack: 5
};

const DEFAULT_SETTINGS = {
  darkMode: true,
  volume: 70,
  sessionGoal: 5,
  autoStartBreaks: false,
  customWorkTime: 25,
  customBreakTime: 5
};