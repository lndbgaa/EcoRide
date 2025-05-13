import { Outlet } from "react-router-dom";

import styles from "./MainLayout.module.css";

const MainLayout = () => {
  return (
    <div>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
