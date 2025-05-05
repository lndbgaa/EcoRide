import { NavLink, Outlet } from "react-router-dom";

const HistoryLayout = () => {
  return (
    <div>
      <div className="flex gap-4 mb-4">
        <NavLink to="rides">Trajets</NavLink>
        <NavLink to="bookings">Réservations</NavLink>
      </div>

      <Outlet />
    </div>
  );
};

export default HistoryLayout;
