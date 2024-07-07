import "../node_modules/bootstrap/dist/css/bootstrap.rtl.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle";
import "../node_modules/@fortawesome/fontawesome-free/css/all.min.css";
import { useEffect } from "react";
import classes from "./App.module.css";

import MyDropzone from "./Components/MyDropZone";
import { useDispatch } from "react-redux";
import { setCompanies } from "./store/slices/dataSlice";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await window.electron.ipcRenderer.invoke(
          "getConfig",
          "companies"
        );
        dispatch(setCompanies(config));
        // console.log(config);
      } catch (error) {
        console.error("Failed to load external config, using default:", error);
      }
    };

    fetchConfig();
  }, [dispatch]);

  return (
    <>
      <nav>
        <h1> دمج قوائم البيانات </h1>
      </nav>
      <div className={classes.container}>
        <MyDropzone />
      </div>
    </>
  );
};

export default App;
