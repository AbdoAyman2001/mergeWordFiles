import { ipcMain, dialog } from "electron";
import fs from "fs";
import path from "node:path";
import mammoth from "mammoth";
import cheerio from "cheerio";
import ExcelJS from "exceljs";
import os from "os";

/**
 * Sets up an IPC handler for merging Word files.
 * Processes the Word files, gets the save path for the Excel file from the user,
 * and appends the processed data to the Excel file.
 */
export const mergeWordFiles = () => {
  ipcMain.handle("merge-word-files", async (event, files) => {
    try {
      const mergedDataArray = await processWordFiles(files);
      const excelPath = await getExcelPathFromUser();
      appendDataToExcel(mergedDataArray, excelPath);
    } catch (error) {
      dialog.showErrorBox("حدث خطأ", error.message);
    }
  });
};


/**
 * Processes an array of Word files.
 * Reads the content of each file and appends it to an array.
 *
 * @param {string[]} files - Array of paths to the Word files.
 * @returns {Promise<Array>} - A promise that resolves to an array containing the merged data from the Word files.
 */
const processWordFiles = async (files) => {
  const mergedDataArray = [];
  for (const file of files) {
    const fileContent = await readWordFile(file);
    // console.log(fileContent);
    mergedDataArray.push(...fileContent);
  }
  // console.log(mergedDataArray);
  return mergedDataArray;
};



/**
 * Reads the content of a Word file and extracts it as an array of objects.
 *
 * @param {string} filePath - Path to the Word file.
 * @returns {Promise<Array>} - A promise that resolves to an array of objects representing the table content.
 */
const readWordFile = async (file) => {

  try {
    const { value: rawHtml } = await mammoth.convertToHtml({ path: file.path });
    const $ = cheerio.load(rawHtml);
    const tables = $("table");
    const tableContent = [];




    tables.each((i, table) => {
      const rows = $(table).find("tr");

      rows.each((j, row) => {
        if (j === 0) return; // Skip the header row

        const cells = $(row).find("td, th");
        const rowData = {
          letterDate: reformatDate(file.letterDate),
          letterNumber : file.letterNumber,
          letterType:file.letterType,
          company: file.company,
          sendingDate: reformatDate(file.sendingDate.split("T")[0]),
          englishName: $(cells[1]).text().trim(),
          arabicName: $(cells[2]).text().trim(),
          nationality: $(cells[3]).text().trim(),
          IDNumber: $(cells[4]).text().trim(),
          authorizedArea: $(cells[5]).text().trim(),
          job: $(cells[6]).text().trim(),
          permitStartDate: $(cells[7]).text().trim(),
          permitEndDate: $(cells[8]).text().trim(),
          birthDate: $(cells[10]).text().trim(),
          qualification: $(cells[11]).text().trim(),
          address: $(cells[12]).text().trim(),
        };
        tableContent.push(rowData);
      });
    });
    // console.log(tableContent);
    return tableContent;
  } catch (error) {
    throw new Error("حدث خطأ فى قراءة ملف الوورد");
    return [];
  }
};




/**
 * Prompts the user to choose a save location for the Excel file.
 *
 * @returns {Promise<string>} - A promise that resolves to the path chosen by the user for saving the Excel file.
 */
const getExcelPathFromUser = async () => {
  const date = new Date();
  const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}_${date
    .getHours()
    .toString()
    .padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}${date
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;
  const defaultFileName = `merged_${formattedDate}.xlsx`;
  const downloadsPath = path.join(os.homedir(), "Downloads", defaultFileName);

  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Save Excel File",
    defaultPath: downloadsPath,
    filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
  });

  if (canceled) {
    throw new Error("Save operation was canceled.");
  }

  // console.log("file path : ", filePath);
  return filePath;
};




/**
 * Creates an Excel file, adds a sheet named "merged", and writes the provided data to the sheet.
 *
 * @param {Array} data - Array of data to write to the Excel sheet.
 * @param {string} excelPath - Path where the Excel file will be saved.
 */
const appendDataToExcel = async (data, excelPath,wordFilePath) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("merged");


    // Define the header row
    const header = [
      "Letter Number",
      "Letter Date",
      "Letter Type",
      "",
      "Sending Date",
      "",
      "",
      "",
      "",
      "English Name",
      "Arabic Name",
      "Nationality",
      "ID Number",
      "Authorized Area",
      "Job",
      "Permit Start Date",
      "Permit End Date",
      "Company",
      "Birth Date",
      "Qualification",
      "Address",
    ];

    // Add the header row to the sheet
    sheet.addRow(header);

    // Add data rows to the sheet
    data.forEach((item) => {
      const row = [
        item.letterNumber,
        item.letterDate,
        item.letterType,
        "",
        item.sendingDate,
        "",
        "",
        "",
        "",
        item.englishName,
        item.arabicName,
        item.nationality,
        item.IDNumber,
        item.authorizedArea,
        item.job,
        item.permitStartDate,
        item.permitEndDate,
        item.company,
        item.birthDate,
        item.qualification,
        item.address,
      ];
      sheet.addRow(row);
    });

    // Save the workbook to the specified path
    await workbook.xlsx.writeFile(excelPath);
    // console.log("Excel file created successfully at:", excelPath);
  } catch (error) {
    console.error("Error creating Excel file:", error);
  }
};




/**
 * Reformat a date from 'dd-mm-yyyy' format to 'dd/mm/yyyy' format.
 * 
 * @param {string} dateStr - The date string in 'dd-mm-yyyy' format.
 * @returns {string} - The reformatted date string in 'dd/mm/yyyy' format.
 * 
 * @example
 * 
 * const reformattedDate = reformatDate('25-12-2023');
 * console.log(reformattedDate); // Output: '25/12/2023'
 */
function reformatDate(dateStr) {
  // Split the input date string by '-'
  const dateParts = dateStr.split('-');

  // Check if the input date string has exactly three parts: day, month, year
  if (dateParts.length !== 3) {
      throw new Error('Invalid date format. Please use "dd-mm-yyyy".');
  }

  // Extract the day, month, and year from the split parts
  const day = dateParts[0];
  const month = dateParts[1];
  const year = dateParts[2];

  // Return the reformatted date string in 'dd/mm/yyyy' format
  return `${year}/${month}/${day}`;
}
