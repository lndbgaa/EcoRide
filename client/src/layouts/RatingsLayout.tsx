import { NavLink, Outlet } from "react-router-dom";

const RatingsLayout = () => {
  return (
    <div>
      <div className="flex gap-4 mb-4">
        <NavLink to="received">Reçus</NavLink>
        <NavLink to="given">Laissés</NavLink>
      </div>

      <Outlet />
    </div>
  );
};

export default RatingsLayout;
