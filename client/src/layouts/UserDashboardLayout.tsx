import { NavLink, Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div>
      <div>Prochain trajets...</div>

      <div className="flex gap-4 mb-4">
        <NavLink to="profile">Profil</NavLink>
        <NavLink to="history">Historique</NavLink>
        <NavLink to="ratings">Avis</NavLink>
      </div>

      <Outlet />
    </div>
  );
};

export default DashboardLayout;
