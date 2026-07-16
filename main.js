// PERF: Caches V8 bytecode on disk so the JS engine doesn't have to recompile
// the main process script on every boot. Shaves ~150-200ms off startup time.
require('v8-compile-cache');
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// ── CACHE FIX (Windows) ────────────────────────────────────────────────────
// Chromium stores HTTP + GPU shader caches inside userData. On Windows the
// old cache directory (from a previous run or a crash) can be locked, causing:
//   cache_util_win.cc  "Unable to move the cache: Access is denied (0x5)"
//   disk_cache.cc      "Unable to create cache"
//   gpu_disk_cache.cc  "Gpu Cache Creation failed: -2"
//
// Three-part fix applied below:

// 1. Redirect userData to a local project folder so Electron always has
//    write access — avoids permission issues with %AppData%\Roaming paths.
const userDataPath = path.join(__dirname, '.electron-data');
app.setPath('userData', userDataPath);

// 2. Proactively delete any stale Cache / GPUCache directories from the
//    previous session BEFORE Chromium tries to migrate them. The migration
//    attempt (cache_util_win.cc) fires before the --disable-http-cache flag
//    is honoured, so wiping the directories is the only reliable prevention.
['Cache', 'GPUCache', 'Code Cache'].forEach(dir => {
  const stalePath = path.join(userDataPath, dir);
  try {
    if (fs.existsSync(stalePath)) fs.rmSync(stalePath, { recursive: true, force: true });
  } catch (_) { /* ignore — directory may be in use */ }
});

// 3. Tell Chromium not to create new disk caches at all. This app makes no
//    network requests (CSP: connect-src 'none'), so caching is pointless.
app.commandLine.appendSwitch('disable-http-cache');
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
// ──────────────────────────────────────────────────────────────────────────

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,

    // PERF: Pre-fill the window with the app's background color so that even
    // if the renderer takes a moment to paint, the user sees a dark window
    // instantly rather than a jarring white flash.
    backgroundColor: '#0f172a',

    webPreferences: {
      // SECURITY: nodeIntegration must be false so renderer JS cannot call
      // Node.js APIs (fs, child_process, etc.) directly. Without this, any
      // XSS or injected script in the renderer has full OS access.
      nodeIntegration: false,

      // SECURITY: contextIsolation separates the Electron preload/main world
      // from the renderer's window object, preventing prototype-chain attacks
      // and ensuring require() is never accessible in page scripts.
      contextIsolation: true,

      // PERF: Keep background tabs/pages at full speed. Prevents Chromium
      // from throttling timers when the window loses focus — important so
      // the study timer stays accurate when the user alt-tabs.
      backgroundThrottling: false
    },
    icon: path.join(__dirname, 'build/icon.png')
  });

  win.loadFile('src/index.html');

  // Remove menu bar for cleaner look
  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});