import { Outlet } from "react-router-dom";

import UserNavbar from "@/components/UserNavbar/UserNavbar";

const MainLayout = () => {
  return (
    <div>
      <UserNavbar />

      <Outlet />
    </div>
  );
};

export default MainLayout;
