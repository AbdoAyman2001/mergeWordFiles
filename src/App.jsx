import "../node_modules/bootstrap/dist/css/bootstrap.rtl.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle";
import "../node_modules/@fortawesome/fontawesome-free/css/all.min.css";
import classes from "./App.module.css";
import MyDropzone from "./Components/MyDropZone";

const App = () => {
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
