import React from "react";
import styles from "./app.module.scss";
import { LayoutContext } from "components";
const App = () => {
  return (
    <>
      <LayoutContext></LayoutContext>
      <div className={styles.app}>hello</div>
    </>
  );
};

export default App;
