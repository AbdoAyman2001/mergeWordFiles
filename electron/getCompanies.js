import { app, ipcMain } from "electron";
import fs from "fs";
import path from "node:path";
const isDev = import("electron-is-dev").then((module) => module.default);


/**
 * Sets up an IPC handler for getting companies of the app.
 */
export const getCompaniesHandler = () => {
  ipcMain.handle("getConfig", async (event, name) => {
    if (!name) return;
    const configPath = (await isDev)
      ? path.join(app.getAppPath(), "public", `${name}.config.json`)
      : path.join(process.resourcesPath, `${name}.config.json`);
  
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

    return config;
  });
};