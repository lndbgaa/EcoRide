import { NavLink, Outlet } from "react-router-dom";

const EmployeeDashboardLayout = () => {
  return (
    <div>
      <div className="flex gap-4 mb-4">
        <NavLink to="reviews">Avis</NavLink>
        <NavLink to="incidents">Incidents</NavLink>
      </div>

      <Outlet />
    </div>
  );
};

export default EmployeeDashboardLayout;
