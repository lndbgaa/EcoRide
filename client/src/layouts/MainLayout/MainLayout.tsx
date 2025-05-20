import { Outlet } from "react-router-dom";

import AdminNavbar from "@/components/AdminNavbar/AdminNavbar";
import EmployeeNavbar from "@/components/EmployeeNavbar/EmployeeNavbar";
import UserNavbar from "@/components/UserNavbar/UserNavbar";
import useAuth from "@/hooks/useAuth";

const MainLayout = () => {
  const { role } = useAuth();

  return (
    <div>
      {role === "admin" ? <AdminNavbar /> : role === "employee" ? <EmployeeNavbar /> : <UserNavbar />}

      <Outlet />
    </div>
  );
};

export default MainLayout;
