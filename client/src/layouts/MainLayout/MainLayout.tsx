import { Outlet } from "react-router-dom";

import styles from "./MainLayout.module.css";

const MainLayout = () => {
  return (
    <div>
      <div style={{ height: "6rem" }}></div>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
