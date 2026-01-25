import React from "react";
import classes from "./FileRow.module.css";
import { useDispatch, useSelector } from "react-redux";
import { removeFile, updateFile } from "../../store/slices/dataSlice";

const FileRow = ({ row, rowIndex }) => {
  const companies = useSelector((state) => state.data.companies);

  const dispatch = useDispatch();

  const letterDateChangeHandler = (e) => {
    const letterDate = new Date(e.target.value).toISOString().split("T")[0];
    dispatch(updateFile({ file: { ...row, letterDate } }));
  };
  const letterNumberChangeHandler = (e) => {
    const letterNumber = isNaN(+e.target.value) ? "" : +e.target.value;
    dispatch(updateFile({ file: { ...row, letterNumber } }));
  };
  const letterTypeChangeHandler = (e) => {
    dispatch(updateFile({ file: { ...row, letterType: e.target.value } }));
  };

  const companyChangeHandler = (e) => {
    dispatch(updateFile({ file: { ...row, company: e.target.value } }));
  };

  const pathClickHandler = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke(
        "navigate-to",
        row.path
      );
    } catch (error) {
      window.alert(`Error happened while opening the folder : ${error}`);
    }
  };

  return (
    <tr className={classes.row}>
      <td style={{ direction: "ltr" }}>
        <a href="#" onClick={pathClickHandler}>
          {row.path}
        </a>
      </td>
      <td className={classes.letterNumber}>
        <input
          className="form-control"
          name="letterNumber"
          id="letterNumber"
          type="number"
          required
          value={row.letterNumber}
          onChange={letterNumberChangeHandler}
        />
      </td>
      <td className={classes.letterDate}>
        <input
          className="form-control"
          name="letterDate"
          id="letterDate"
          required
          type="date"
          onChange={letterDateChangeHandler}
          value={row.letterDate}
        />
      </td>
      <td className={classes.letterType}>
        <select
          className="form-select"
          name="letterType"
          id="letterType"
          required
          value={row.letterType}
          onChange={letterTypeChangeHandler}
        >
          <option value="">نوع الخطاب</option>
          <option value="Site Access">Site Access</option>
          <option value="Site Access/Transfer">Transfer</option>
          <option value="Family member">Family</option>
        </select>
      </td>

      <td className={classes.company}>
        <input
          className="form-control"
          name="company"
          id={`company-${rowIndex}`}
          list={`companies-list-${rowIndex}`}
          required
          value={row.company || ""}
          onChange={companyChangeHandler}
          placeholder="Select company..."
          dir="ltr"
        />
        <datalist id={`companies-list-${rowIndex}`}>
          {companies.map((item, index) => (
            <option key={index} value={item} />
          ))}
        </datalist>
      </td>

      <td>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => dispatch(removeFile({ index: rowIndex }))}
        >
          <i className="fa-solid fa-trash-can"></i>
        </button>
      </td>
    </tr>
  );
};

export default FileRow;
