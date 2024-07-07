import { createSlice } from "@reduxjs/toolkit";

export const defaultConfig = {
  files: [],
  companies: [],
};

export const dataSlice = createSlice({
  name: "data",
  initialState: defaultConfig,
  reducers: {
    addFiles: (state, { payload }) => {
      // Ensure payload is an array for consistency
      const filesToAdd = Array.isArray(payload) ? payload : [payload];

      // Filter out any files that already exist in the state
      const newFiles = filesToAdd.filter(
        (file) =>
          !state.files.some((existingFile) => existingFile.path === file.path)
      );

      // Add only the new files to the state
      state.files = [...state.files, ...newFiles];
    },
    setCompanies: (state, { payload }) => {
      state.companies = payload;
    },

    removeFile: (state, { payload }) => {
      state.files.splice(payload.index, 1);
    },
    updateFile: (state, { payload }) => {
      const fileIndex = state.files.findIndex(
        (file) => file.path === payload.file.path
      );
      if (fileIndex !== -1) {
        state.files[fileIndex] = { ...state.files[fileIndex], ...payload.file };
      }
    },
    resetFiles: (state, { payload }) => {
      state.files = [];
    },
  },
});

export const { addFiles, resetFiles, removeFile, updateFile, setCompanies } =
  dataSlice.actions;

export default dataSlice.reducer;
