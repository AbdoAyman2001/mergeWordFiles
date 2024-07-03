import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFiles } from "../store/slices/dataSlice";
import classes from "./SelectButton.module.css";

const SelectButton = ({ label }) => {
  const files = useSelector((data) => data.data.files);
  const dispatch = useDispatch();

  console.log("files : ", files);
  const handleClick = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke("select-folders-with-dialog");
      console.log(result);
      if (!result.canceled && result.filePaths.length > 0) {
        dispatch(addFiles(result.fileInfo));
      }
    } catch (error) {
      console.error("Failed to open file dialog:", error);
    }
  };

  return (
    <button
      type="button"
      className={`btn btn-primary ${classes.btn}`}
      onClick={handleClick}
    >
      إضافة فولدر خطاب
    </button>
  );
};

export default SelectButton;
