import { ipcMain, dialog } from "electron";
import fs from "fs";
import path from "node:path";

export const selectWordFiles = () => {
  ipcMain.handle("select-folders-with-dialog", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory", "multiSelections"],
    });

    // Separate folders and files
    const folders = result.filePaths.filter((filePath) =>
      fs.statSync(filePath).isDirectory()
    );

    if (folders.length > 0) {
      const wordFilesPaths = await selectFolders(folders);
      return { ...result, fileInfo: wordFilesPaths };
    } else {
      return { canceled: true }; // If the selection does not meet the criteria
    }
  });

  // IPC handler to show error dialog
  ipcMain.handle("show-error-dialog", async (event, message) => {
    dialog.showErrorBox("Error", message);
  });

  ipcMain.handle("select-word-files", async (event, filePaths) => {
    const fileInfoArr = [];
    try {
      for (const filePath of filePaths) {
        const fileInfo = await getFileInformation(filePath);
        console.log(fileInfo);
        fileInfoArr.push(fileInfo);
      }
    } catch (error) {
      console.error("error while selecting word files: ", error);
      return { cancelled: true };
    }
    console.log(fileInfoArr);
    return { cancelled: false, fileInfo: fileInfoArr, filePaths };
  });
};

const selectFolders = async (folders) => {
  const wordFilesPaths = [];

  folders.forEach((folderPath) => {
    console.log("start processing folder : ", folderPath);
    const filesInDirectory = fs.readdirSync(folderPath);

    //checking if there is another folder inside the folder (correction existed)
    for (const entry of filesInDirectory) {
      const fullPath = path.join(folderPath, entry);
      if (fs.statSync(fullPath).isDirectory()) {
        dialog.showErrorBox(
          "تحذير",
          `يوجد فولدر آخر ${entry} \n داخل فولدر ${path.basename(
            folderPath
          )} ، \nقد يكون هناك تصحيح للخطاب`
        );
        return;
      }
    }

    // Filter for files that match the conditions
    const matchingFiles = filesInDirectory.filter((file) => {
      const filePath = path.join(folderPath, file);
      return (
        fs.statSync(filePath).isFile() &&
        (file.endsWith(".doc") || file.endsWith(".docx")) &&
        file.includes("قائمة بيانات")
      );
    });

    // Check if there is exactly one matching file in the folder
    if (matchingFiles.length === 1) {
      const filePath = path.join(folderPath, matchingFiles[0]);
      // Check if the filePath is already in wordFilesPaths
      if (!wordFilesPaths.includes(filePath)) {
        wordFilesPaths.push(filePath);
      }
    }
  });

  if (folders.length !== wordFilesPaths.length) {
    dialog.showErrorBox("حدث خطأ", "غير قادر على استخراج بعض قوائم البيانات");
  }

  // Get the file info for each filePath in the wordFilesPaths array
  const filesInfo = await Promise.all(
    wordFilesPaths.map(async (filePath) => {
      return await getFileInformation(filePath);
    })
  );

  console.log(filesInfo);
  return filesInfo; // Return filesInfo so it can be used by the calling function
};

// Function to get file information
export const getFileInformation = async (filePath) => {
  const stats = await fs.promises.stat(filePath);
  const pdfSiblingName = getSiblingPdfFilename(filePath);
  console.log("pdfSiblling : ", pdfSiblingName)
  return {
    name: path.basename(filePath),
    path: filePath,
    size: stats.size,
    modifiedDate: stats.mtime.toISOString(),
    createdDate: stats.ctime.toISOString(),
    pdfSibling: pdfSiblingName,
    letterNumber: getLetterNumber(pdfSiblingName),
    letterDate: getLetterDate(pdfSiblingName),
    letterType: getLetterType(pdfSiblingName),
    sendingDate : getLetterSendingDate(filePath),
  };
};

const getLetterSendingDate =(filePath)=>{
  const dir = path.dirname(filePath);
  const files = fs.readdirSync(dir);
  const msgFile = files.find(file => file.endsWith('.msg'));

  if(!msgFile)   return "";
  
  const msgFilePath = path.join(dir, msgFile);
  const stats = fs.statSync(msgFilePath);
  return stats.birthtime.toISOString();
}

const getSiblingPdfFilename = (wordFilePath) => {
  const directory = path.dirname(wordFilePath);
  const filesInDirectory = fs.readdirSync(directory);

  // Define the regex pattern for the beginning of the PDF filename
  const pdfFilenamePattern =
    /^[0-9]+\s[A-Za-z]{2}\s(?:\d{8}|\d{2}\.\d{2}\.\d{4})/;

  // Filter the files that match the pattern and are PDF files
  const matchingPdfFiles = filesInDirectory.filter(
    (file) =>
      path.extname(file).toLowerCase() === ".pdf" &&
      pdfFilenamePattern.test(path.basename(file))
  );

  // Return the filename if exactly one match is found, otherwise return an empty string
  return matchingPdfFiles.length === 1 ? matchingPdfFiles[0] : "";
};

const getLetterNumber = (pdfSibling) => {
  if (pdfSibling === "") return "";
  const letterNumber = pdfSibling.split(" ")[0];
  return isNaN(+letterNumber) ? "" : +letterNumber;
};

const getLetterDate = (pdfFilename) => {
  const regexPattern = /(\s\d{8})|(\s\d{2}\.\d{2}\.\d{4})/;
  const match = pdfFilename.match(regexPattern);

  if (!match) return "";

  let day, month, year;

  if (match[1]) {
    // Pattern \d{8} (ddmmyyyy)
    const dateStr = match[1].trim();
    day = dateStr.slice(0, 2);
    month = dateStr.slice(2, 4);
    year = dateStr.slice(4, 8);
  } else if (match[2]) {
    // Pattern \d{2}\.\d{2}\.\d{4} (dd.mm.yyyy)
    const dateStr = match[2].trim().split("_")[0].split(".");
    day = dateStr[0];
    month = dateStr[1];
    year = dateStr[2];
  }

  console.log(`date to initialize : ${day}-${month}-${year}`);
  const isoDate = new Date(`${year}-${month}-${day}`).toISOString();

  return isoDate.split("T")[0]; // Return only the date part in ISO format
};

const getLetterType = (pdfFilename) => {
  // Take the second element as the new filename and convert to lowercase
  const newFilename = pdfFilename.trim().toLowerCase();

  console.log("new File Name : ",newFilename)

  // Check the starting string of the new filename
  if (newFilename.includes("on the transfer an employee")) {
    return "Site Access/Transfer";
  } else if (newFilename.includes("on the site access for family")) {
    return "Family member";
  } else if (newFilename.includes("on the site access for contractor")) {
    return "Site Access";
  } else {
    return "";
  }
};
