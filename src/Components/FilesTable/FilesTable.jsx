import React from "react";
import classes from "./FilesTable.module.css";
import { useSelector } from "react-redux";
import FileRow from "./FileRow";

const columns = {
  path: "مسار الملف",
  letterNumber: "رقم الخطاب",
  letterDate: "تاريخ الخطاب",
  letterType: "نوع الخطاب",
  company:"الشركة"
};

const FilesTable = () => {
  const files = useSelector((data) => data.data.files);

  return (
    <table className={`table table-striped ${classes.myTable}`}>
      <thead>
        <tr>
          {Object.values(columns).map((column, index) => (
            <th key={index}>{column}</th>
          ))}
          <th>
            <i className="fa-solid fa-trash-can"></i>{" "}
          </th>
        </tr>
      </thead>

      <tbody>
        {files.length > 0 &&
          files.map((row, rowIndex) => (
            <FileRow key={rowIndex} row={row} rowIndex={rowIndex} />
          ))}
        {files.length === 0 ? (
          <tr className={classes.whiteRow}>
            <td colSpan={4}>من فضلك أضف قوائم بيانات</td>
          </tr>
        ) : (
          ""
        )}
      </tbody>
    </table>
  );
};

export default FilesTable;
