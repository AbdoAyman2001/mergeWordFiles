import { app, ipcMain } from "electron";
import fs from "fs";
import path from "node:path";
const isDev = import("electron-is-dev").then((module) => module.default);


/**
 * Sets up an IPC handler for saving companies to the config file.
 */
export const saveCompaniesHandler = () => {
  ipcMain.handle("saveConfig", async (event, name, data) => {
    if (!name || !data) return { success: false, error: "Invalid parameters" };

    try {
      const configPath = (await isDev)
        ? path.join(app.getAppPath(), "public", `${name}.config.json`)
        : path.join(process.resourcesPath, `${name}.config.json`);

      fs.writeFileSync(configPath, JSON.stringify(data, null, 2), "utf-8");

      return { success: true };
    } catch (error) {
      console.error("Error saving config:", error);
      return { success: false, error: error.message };
    }
  });
};
