import React, { useState } from "react";
import classes from "./ComboBox.module.css";
import { updateFile } from "../../store/slices/dataSlice";
import { useDispatch, useSelector } from "react-redux";

const Combobox = ({ companies, row }) => {
  const dispatch = useDispatch();

  const query = row.company || "";
  const [filteredOptions, setFilteredOptions] = useState(companies);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const setQuery = (query) => {
    dispatch(updateFile({ file: { ...row, company: query } }));
  };

  // Filter options based on the query
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length >= 2) {
      const filtered = companies.filter((company) =>
        company.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
      setIsDropdownVisible(true);
      setIsValid(
        filtered.some(
          (company) => company.toLowerCase() === value.toLowerCase()
        )
      );
    } else {
      setFilteredOptions(companies);
      setIsDropdownVisible(false);
      setIsValid(false);
    }
  };

  // Handle option selection
  const handleOptionClick = (option) => {
    setQuery(option);
    setIsDropdownVisible(false);
    setIsValid(true);
  };

  // Handle blur event to validate input
  const handleBlur = () => {
    setTimeout(() => {
      const matchedCompany = companies.find(
        (company) => company.toLowerCase() === query.toLowerCase()
      );

      if (matchedCompany) {
        setQuery(matchedCompany); // Set query to the exact matched company
        setIsValid(true);
      } else {
        setQuery(""); // Clear query if no match
        setIsValid(false);
      }

      setIsDropdownVisible(false);
    }, 200);
  };

  return (
    <div className={classes.comboboxContainer}>
      <input
        type="text"
        dir="ltr"
        value={query}
        onChange={handleInputChange}
        onFocus={() => query.length >= 2 && setIsDropdownVisible(true)}
        onBlur={handleBlur}
        placeholder="Type to search..."
        className={`${classes.input} ${isValid ? "" : classes.invalid}`}
      />
      {isDropdownVisible && (
        <ul className={classes.dropdown}>
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              onMouseDown={() => handleOptionClick(option)} // Changed from onClick to onMouseDown
              className={classes.option}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Combobox;
