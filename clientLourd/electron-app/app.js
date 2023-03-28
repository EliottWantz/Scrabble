const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let appWindow;

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

  appWindow.maximize();

  // Electron Build Path
  const path = `http://localhost:4200`;
  appWindow.loadURL(path);

  appWindow.setMenuBarVisibility(false);

  // Initialize the DevTools.
  appWindow.webContents.openDevTools();

  appWindow.on("closed", function () {
    appWindow = null;
  });

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
  chatWindow.on("closed", function (e) {
    e.preventDefault();
    console.log("closing the chat window tab is disable");
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
  if (appWindow === null || chatWindow === null) {
    initWindow();
  }
});

ipcMain.on("open-chat", (event, data) => {
  console.log("ipcMain received open-chat event. data:", data);
  event.reply("open-chat-reply", "response from ipcMain (open)");
  chatWindow.show();
});

ipcMain.on("close-chat", (event, data) => {
  console.log("ipcMain received close-chat event. data:", data);
  event.reply("close-chat-reply", "response from ipcMain (close)");
  chatWindow.hide();
});
