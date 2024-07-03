// src/DragAndDrop.js
import React, { useEffect, useState } from "react";
import styles from "./DragAndDrop.module.css";
import { useDispatch } from "react-redux";
import { addFiles } from "../../store/slices/dataSlice";

const DragAndDrop = () => {
  const [dragging, setDragging] = useState(false);
  const dispatch = useDispatch();

  const onDrop = async (wordFiles) => {
    const filePaths = wordFiles.map((file) => file.path);
    try {
      const result = await window.electron.ipcRenderer.invoke(
        "select-word-files",
        filePaths
      );
      console.log(result);
      if (!result.canceled && result.filePaths.length > 0) {
        dispatch(addFiles(result.fileInfo));
      }
    } catch (error) {
      console.error("Failed to open file dialog:", error);
    }
  };

  useEffect(() => {
    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const folders = files.filter((file) => file.type === "");
      const wordFiles = files.filter(
        (file) =>
          file.type === "application/msword" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );

      if (folders.length > 0) {
        window.electron.ipcRenderer.invoke(
          "show-error-dialog",
          "يسمح فقط بإسقاط ملفات وورد هنا، إذا كنت تريد إضافة مجلدات، استخدم الزر أعلاه"
        );
        return;
      }

      if (wordFiles.length > 0) {
        onDrop(wordFiles);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  return (
    <div
      className={`${styles.dropzone} ${
        dragging ? styles.dropzoneDragging : ""
      }`}
    >
      <input
        type="file"
        multiple
        accept=".doc,.docx"
        className={styles.hiddenInput}
        onChange={(e) => {
          const files = Array.from(e.target.files);
          const wordFiles = files.filter(
            (file) =>
              file.type === "application/msword" ||
              file.type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          );
          onDrop(wordFiles);
        }}
      />
    </div>
  );
};

export default DragAndDrop;
