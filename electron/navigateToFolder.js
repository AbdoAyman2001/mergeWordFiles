import { ipcMain, dialog } from "electron";
import fs from "fs";
import path from "node:path";
import { exec } from "child_process";
import { platform } from "os";

export const navigteToFolder = () => {
  ipcMain.handle("navigate-to", async (event, filePath) => {
    const folderPath = path.dirname(filePath);

    const command =
      platform() === "win32"
        ? `start "" "${folderPath}"`
        : platform() === "darwin"
        ? `open "${folderPath}"`
        : `xdg-open "${folderPath}"`;

    exec(command);
  });
};
