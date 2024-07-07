// electron/electron-main.js
import { app, BrowserWindow, dialog, globalShortcut, ipcMain } from "electron";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs";
import path from "node:path";
import { selectWordFiles } from "./selectWordFiles.js";
import { mergeWordFiles } from "./mergeWordFiles.js";
import { navigteToFolder } from "./navigateToFolder.js";
import { getCompaniesHandler } from "./getCompanies.js";

selectWordFiles();
mergeWordFiles();
navigteToFolder();
getCompaniesHandler()

const isDev = import("electron-is-dev").then((module) => module.default);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const windowIcon = join(__dirname, "assets/logo_cropped.ico");

let mainWindow;
const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    icon: windowIcon,
    webPreferences: {
      preload: join(__dirname, "preload.js"), // Ensure this path is correct
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  console.log("is dev : ", await isDev);
  const startUrl = (await isDev)
    ? "http://localhost:5173"
    : `file://${join(__dirname, "../dist/index.html")}`;

  try {
    mainWindow.loadURL(startUrl);
  } catch (error) {
    logToFile(error);
    mainWindow.webContents.openDevTools();
  }

  mainWindow.removeMenu();
  if (await isDev) {
    mainWindow.webContents.openDevTools();
  }
  const session = mainWindow.webContents.session;
  session.clearCache().then(() => {});
  mainWindow.maximize();
};

// app.whenReady().then(createWindow);

app.on("ready", () => {
  createWindow();

  const ret = globalShortcut.register("CommandOrControl+R", () => {
    mainWindow.webContents.reload();
  });

  if (!ret) {
    console.log("Registration failed");
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregister("CommandOrControl+R");
  globalShortcut.unregisterAll();
});
