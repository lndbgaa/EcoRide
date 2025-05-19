import { Outlet } from "react-router-dom";

import EmployeeNavbar from "@/components/EmployeeNavbar/EmployeeNavbar";

const EmployeeLayout = () => {
  return (
    <div>
      <EmployeeNavbar />

      <Outlet />
    </div>
  );
};

export default EmployeeLayout;
