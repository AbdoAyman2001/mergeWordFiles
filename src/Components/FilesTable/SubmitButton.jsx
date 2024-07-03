import React from "react";
import classes from "./SubmitButton.module.css";

const SubmitButton = ({ isSubmitting }) => {
  if (isSubmitting) {
    return (
      <button
        className={`btn btn-primary ${classes.btn}`}
        type="submit"
        disabled
      >
        جارى الدمج ...
      </button>
    );
  } else {
    return (
      <button className={`btn btn-primary ${classes.btn}`} type="submit">
        دمج
      </button>
    );
  }
};

export default SubmitButton;
