import React, { useState } from "react";
import SelectButton from "./SelectButton";
import FilesTable from "./FilesTable/FilesTable";
import { useDispatch, useSelector } from "react-redux";
import SubmitButton from "./FilesTable/SubmitButton";
import classes from "./MyDropZone.module.css";
import { resetFiles } from "../store/slices/dataSlice";
import DragAndDrop from "./DragAndDrop/DragAndDrop";

const MyDropZone = ({ onAddCompany }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const files = useSelector((state) => state.data.files);
  const dispatch = useDispatch();
  const submitHandler = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      e.stopPropagation();
    }

    if (!e.nativeEvent.submitter && e.nativeEvent.submitter.type === "submit")
      return;

    setIsValidated(true);

    if (!form.checkValidity()) return;

    setIsSubmitting(true);
    try {
      const result = await window.electron.ipcRenderer.invoke(
        "merge-word-files",
        files
      );
      // dispatch(resetFiles());
    } catch (error) {
      window.alert(`Error happened : ${error}`);
    }
    setIsSubmitting(false);
    setIsValidated(false);
  };

  return (
    <div>
      <form
        noValidate
        className={`${classes.form} needs-validation ${
          isValidated ? "was-validated" : ""
        }`}
        onSubmit={submitHandler}
      >
        <DragAndDrop />

        <div className={classes.buttonGroup}>
          <SelectButton />
          <button
            type="button"
            className={`btn btn-outline-primary ${classes.addCompanyBtn}`}
            onClick={onAddCompany}
          >
            <i className="fas fa-plus"></i> Add Company
          </button>
        </div>
        {files.length > 0 && <SubmitButton isSubmitting={isSubmitting} />}
        <FilesTable />
      </form>
    </div>
  );
};

export default MyDropZone;
