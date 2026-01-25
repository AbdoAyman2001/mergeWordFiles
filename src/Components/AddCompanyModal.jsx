import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCompany } from "../store/slices/dataSlice";
import classes from "./AddCompanyModal.module.css";

const AddCompanyModal = ({ show, onClose }) => {
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const companies = useSelector((state) => state.data.companies);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = companyName.trim();

    if (!trimmedName) {
      setError("Company name cannot be empty");
      return;
    }

    if (companies.some(c => c.toLowerCase() === trimmedName.toLowerCase())) {
      setError("This company already exists");
      return;
    }

    setIsLoading(true);

    try {
      const updatedCompanies = [...companies, trimmedName];

      const result = await window.electron.ipcRenderer.invoke(
        "saveConfig",
        "companies",
        updatedCompanies
      );

      if (result.success) {
        dispatch(addCompany(trimmedName));
        setCompanyName("");
        onClose();
      } else {
        setError(`Failed to save: ${result.error}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className={classes.modalOverlay} onClick={onClose}>
      <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={classes.modalHeader}>
          <h5 className={classes.modalTitle}>Add New Company</h5>
          <button
            type="button"
            className={classes.closeButton}
            onClick={onClose}
            disabled={isLoading}
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={classes.modalBody}>
            <div className={classes.formGroup}>
              <label htmlFor="companyName" className={classes.label}>
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                className={classes.input}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                disabled={isLoading}
                autoFocus
              />
            </div>
            {error && <div className={classes.error}>{error}</div>}
          </div>
          <div className={classes.modalFooter}>
            <button
              type="button"
              className={`${classes.button} ${classes.buttonSecondary}`}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${classes.button} ${classes.buttonPrimary}`}
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCompanyModal;
