const { app, BrowserWindow, ipcMain } = require("electron");
let appWindow;
let chatWindow;
let userData;

function initWindow() {
  appWindow = new BrowserWindow({
    // fullscreen: true,
    height: 800,
    width: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Electron Build Path
  const path = `http://localhost:4200`;
  appWindow.loadURL(path);

  appWindow.setMenuBarVisibility(false);

  // Initialize the DevTools.
  appWindow.webContents.openDevTools();

  appWindow.on("closed", function () {
    appWindow = null;
    if (chatWindow) {
      chatWindow.destroy();
    }
    chatWindow = null;

    app.quit();
  });
}

function openChatwindow() {
  if (!appWindow) {
    console.error("appWindow is not defined.");
    return;
  }
  chatWindow = new BrowserWindow({
    height: 600,
    width: 800,
    minHeight: 600,
    minWidth: 800,
    maxHeight: 1080,
    maxWidth: 1920,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  chatWindow.loadURL("http://localhost:4200/chatbox");
  chatWindow.setMenuBarVisibility(false);
  chatWindow.webContents.openDevTools();

  chatWindow.on("close", function (event) {
    event.preventDefault();
    appWindow.webContents.send("close-chat");
    chatWindow.hide();
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
    openChatwindow();
  }
});

ipcMain.on("open-chat", (event, data) => {
  appWindow.webContents.send("open-chat");
  if (chatWindow == null) {
    openChatwindow();
  }
  userData = data;
  chatWindow.show();
});

ipcMain.on("request-user-data", (event, data) => {
  chatWindow.webContents.send("user-data", userData);
});
