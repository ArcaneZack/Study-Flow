# Study Flow

A beautiful desktop application to help you manage study time, prevent burnout, and stay productive using the Pomodoro Technique and other focus methods.

![Version](https://img.shields.io/badge/version-1.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

## ✨ Features

### 🎯 Focus Timer
- **Multiple timer modes**: Pomodoro (25/5), Deep Work (50/10), Short Sprint (15/3)
- **Custom timer lengths**: Set your own work and break durations
- **Auto-start breaks**: Automatically begin break timers after focus sessions
- **Visual progress ring**: Beautiful circular timer display
- **Session tracking**: Track daily sessions and total study minutes

### ⚡ Energy Management
- **Burnout prevention**: Real-time energy level tracking
- **Recovery activities**: Quick-access buttons for breaks, exercise, meditation, and snacks
- **Custom activities**: Create your own recovery activities with custom names, boost amounts, and colors
- **Visual warnings**: Get notified when approaching burnout

### ✅ Task Management
- **Priority levels**: Organize tasks by High, Medium, or Low priority
- **Categories**: Group tasks by subject (Math, Science, History, Language, Art, or custom)
- **Color coding**: Visual indicators for priorities and categories
- **Quick actions**: Check off completed tasks, delete unnecessary ones

### 📊 Statistics & Analytics
- **Weekly charts**: Bar graph showing sessions and minutes for the last 7 days
- **Progress tracking**: See your best day, average session length, and totals
- **Daily goals**: Set session goals and track your progress

### 🎨 Customization
- **Dark/Light mode**: Switch between themes
- **Custom alarm sounds**: Upload your own MP3, WAV, or OGG files
- **Volume control**: Adjust alarm volume
- **Session notes**: Add notes about what you accomplished after each session
- **Break suggestions**: Random helpful tips during breaks

### ⌨️ Productivity Features
- **Keyboard shortcuts**: Control the app without touching your mouse
- **Focus quotes**: Motivational quotes to keep you inspired
- **Data export**: Download your tasks and statistics as JSON
- **Persistent storage**: Your data is saved automatically

## 🚀 Installation

### Download Pre-built App

1. Go to [Releases](https://github.com/ArcaneZack/Focus-Applicaiton/releases)
2. Download the version for your OS:
   - **Windows**: `Study-Flow-Setup-1.2.0.exe`
   - **macOS**: `Study-Flow-1.2.0.dmg`
   - **Linux**: `Study-Flow-1.2.0.AppImage`
3. Install and run!

### Build From Source

**Requirements:**
- Node.js 16+ and npm

**Steps:**

```bash
# Clone the repository
git clone https://github.com/ArcaneZack/Focus-Applicaiton.git
cd Focus-Applicaiton

# Install dependencies
npm install

# Run in development
npm start

# Build for your platform
npm run build
```

The built app will be in the `dist/` folder.

## 📖 Usage

### Basic Workflow

1. **Set a timer**: Choose Pomodoro, Deep Work, or Custom mode
2. **Add tasks**: Create your study task list with priorities and categories
3. **Start focusing**: Press Space or click Play to begin
4. **Take breaks**: Click recovery activities when your energy drops
5. **Track progress**: View your statistics and celebrate achievements

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause timer |
| `R` | Reset timer |
| `T` | Open statistics page |
| `S` | Open settings |
| `Esc` | Return to home |

### Energy System

Your energy starts at 100% and drains while working:
- **Fresh (70-100%)**: Peak performance
- **Good (40-69%)**: Productive but monitor
- **Tired (20-39%)**: Consider taking a break
- **Burnout Risk (<20%)**: Take a longer recovery break

Recovery activities restore energy:
- Break: +10%
- Exercise: +15%
- Meditate: +20%
- Snack: +5%
- Custom activities: Your choice (1-50%)

## 🛠️ Configuration

All settings are accessible via the Settings page (⚙️ icon or press `S`):

- **Timer**: Custom work/break lengths, auto-start breaks
- **Appearance**: Dark/light mode toggle
- **Sound**: Volume control, custom alarm upload
- **Activities**: Create custom energy recovery activities
- **Categories**: Add custom task categories
- **Export**: Download your data

## 📁 Project Structure

```
study-flow/
├── src/
│   ├── index.html          # Main application UI
│   ├── styles.css          # All styles
│   └── js/
│       ├── app.js          # Application initialization
│       ├── constants.js    # Configuration constants
│       ├── state.js        # State management & storage
│       ├── timer.js        # Timer logic
│       ├── tasks.js        # Task management
│       ├── energy.js       # Energy tracking
│       ├── settings.js     # Settings management
│       ├── stats.js        # Statistics & charts
│       └── ui.js           # UI rendering
├── main.js                 # Electron main process
├── package.json            # Dependencies & build config
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your OS and app version

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)
- Inspired by the Pomodoro Technique

## 📧 Contact

Project Link: [https://github.com/ArcaneZack/Focus-Applicaiton](https://github.com/ArcaneZack/Focus-Applicaiton)

---

**Made with ❤️ to help students focus better and avoid burnout**
