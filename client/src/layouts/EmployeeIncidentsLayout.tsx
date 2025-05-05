import { NavLink, Outlet } from "react-router-dom";

const EmployeeIncidentsLayouts = () => {
  return (
    <div>
      <div className="flex gap-4 mb-4">
        <NavLink to="new">Nouveau</NavLink>
        <NavLink to="assigned">Assignés</NavLink>
        <NavLink to="resolved">Résolus</NavLink>
      </div>
      <Outlet />
    </div>
  );
};

export default EmployeeIncidentsLayouts;
