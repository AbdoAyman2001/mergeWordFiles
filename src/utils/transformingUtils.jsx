// Constants for supported file types
const SUPPORTED_EXTENSIONS = ["docx"];

// Utility to check for duplicates and unsupported file types
export const processFiles = async (fileList, existingFiles) => {
  const newFiles = [];
  const errors = {
    duplicateFiles: [],
    unsupportedFiles: [],
    notExistedPdfFile: [],
    duplicatePdfFile: [],
  };

  const existingPaths = new Set(existingFiles.map((file) => file.path));

  console.log("existign paths : ", existingFiles);

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    if (existingPaths.has(file.path)) {
      errors.duplicateFiles.push(file.path);
      continue;
    }

    const extension = file.name.split(".").pop();
    if (!SUPPORTED_EXTENSIONS.includes(extension.toLowerCase())) {
      errors.unsupportedFiles.push(file.path);
      continue;
    }

    let letterData = { receivingDate: "", letterNumber: "", letterType: "" };
    const pdfSiblings = [...new Set(await getPdfSiblings(file))];
    console.log("pdf siblings : ", pdfSiblings.length);

    if (pdfSiblings.length > 1) errors.duplicatePdfFile.push(file.path);
    else if (pdfSiblings.length < 1) errors.notExistedPdfFile.push(file.path);
    else {
      letterData.receivingDate = createDateFromDDMMYYYY(pdfSiblings[0]);
      letterData.letterNumber = pdfSiblings[0].split(" ")[0];
      letterData.letterType = "";
    }
    console.log("errors : ", errors);

    const serializableFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      path: file.path,
      lastModified: file.lastModified,
      lastModifiedDate: file.lastModifiedDate.toLocaleDateString(),
      ...letterData,
    };
    newFiles.push(serializableFile);
    existingPaths.add(file.path); // Update set to include the new file path
  }

  return { newFiles, errors };
};

const getPdfSiblings = async (file) => {
  try {
    const pdfFiles = await window.electron.ipcRenderer.invoke(
      "find-sibling-pdf",
      file.path
    );
    if (pdfFiles.length > 0) {
      const pattern = /^\d+\s[a-zA-Z]{2}\s\d{6}_/;
      pdfFiles.filter((file) => pattern.test(file));
      return pdfFiles;
    } else {
      console.log("No PDF files found in the directory.");
    }
  } catch (error) {
    throw new Error("Error finding PDF files:", error);
  }
};

const createDateFromDDMMYYYY = (pdfFileName) => {
  // extract the date form the file name
  const dateStr = pdfFileName.match(/\d{8}_/)[0];

  console.log(dateStr);

  // Check if the input is exactly 8 digits followed by an underscore
  if (!/^\d{8}_/.test(dateStr)) {
    throw new Error("Invalid date format");
  }

  // Extract the date parts
  const day = parseInt(dateStr.substring(0, 2), 10);
  const month = parseInt(dateStr.substring(2, 4), 10); // adjust month index for JS Date
  const year = parseInt(dateStr.substring(4, 8), 10);

  // Create the date object
  return new Date(year, month, day).toISOString().split("T")[0];
};

export const getLastTwoPathLevels = (filePath) => {
  // Split the path into parts
  // Normalize the path by replacing backslashes with forward slashes
  // This also handles double backslashes
  const normalizedPath = filePath.replace(/\\\\|\\/g, "/");
  console.log(normalizedPath);

  const parts = normalizedPath.split("/");

  // Check if there are at least two parts
  if (parts.length >= 2) {
    // Get the last two parts of the array
    return parts.slice(-2).join("/");
  } else {
    // Return the original path or an error message
    return normalizedPath;
  }
};
