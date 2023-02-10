const { app, BrowserWindow } = require("electron");

let appWindow;

function initWindow() {
  appWindow = new BrowserWindow({
    height: 800,
    width: 1000,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  appWindow.maximize();

  // Electron Build Path
  const path = `http://localhost:4200`;
  appWindow.loadURL(path);

  appWindow.setMenuBarVisibility(false);

  // Initialize the DevTools.
  appWindow.webContents.openDevTools()

  appWindow.on("closed", function () {
    appWindow = null;
  });
}

app.on("ready", initWindow);

// Close when all windows are closed.
app.on("window-all-closed", function () {
  // On macOS specific close process
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (appWindow === null) {
    initWindow();
  }
});
