const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    },
    icon: path.join(__dirname, 'icon.png') // optional
  });

  // Load the app's HTML from the `src` folder
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
  
  // Remove menu bar (optional - cleaner look)
  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});