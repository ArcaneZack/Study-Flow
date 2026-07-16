const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 512,
    height: 512,
    show: false, // We don't need to show it to capture it
    transparent: true,
    frame: false,
    webPreferences: { 
      nodeIntegration: true, 
      contextIsolation: false 
    }
  });

  const svg = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#312e81" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <linearGradient id="arc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c084fc" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
        <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="15" stdDeviation="20" flood-color="#000000" flood-opacity="0.4"/>
        </filter>
        <filter id="glow">
          <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- App Icon Base -->
      <rect x="32" y="32" width="448" height="448" rx="100" fill="url(#bg-grad)" filter="url(#drop-shadow)"/>
      <rect x="32" y="32" width="448" height="448" rx="100" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>

      <!-- Timer Track -->
      <circle cx="256" cy="256" r="120" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="24" />
      
      <!-- Progress Arc with Glow -->
      <path d="M 256 136 A 120 120 0 1 1 136 256" fill="none" stroke="url(#arc-grad)" stroke-width="24" stroke-linecap="round" filter="url(#glow)" />
      
      <!-- Clock Hands -->
      <circle cx="256" cy="256" r="12" fill="#ffffff" />
      <path d="M 256 256 L 256 166" fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" />
      <path d="M 256 256 L 320 320" fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" />
    </svg>
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 0; overflow: hidden; background: transparent; display: flex; align-items: center; justify-content: center; height: 100vh; }
      </style>
    </head>
    <body>
      ${svg}
    </body>
    </html>
  `;

  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  
  // Wait a bit to ensure rendering is complete
  await new Promise(r => setTimeout(r, 1500));
  
  const image = await win.webContents.capturePage();
  fs.writeFileSync(path.join(__dirname, 'build', 'icon.png'), image.toPNG());
  
  console.log('Successfully generated transparent, high-res icon.png!');
  app.quit();
});
