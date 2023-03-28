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

  chatWindow.on("closed", function (event) {
    event.preventDefault();
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
  }
});

ipcMain.on("open-chat", (event, data) => {
  console.log("ipcMain received open-chat event. data:", data);
  event.reply("open-chat-reply", "response from ipcMain (open)");
  if (chatWindow == null) {
    openChatwindow();
  }
  userData = data;
  chatWindow.show();
});

ipcMain.on("request-user-data", (event) => {
  event.reply("user-data", userData);
});

ipcMain.on("close-chat", (event, data) => {
  console.log("ipcMain received close-chat event. data:", data);
  event.reply("close-chat-reply", "response from ipcMain (close)");
});
