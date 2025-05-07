import useAuth from "@/hooks/useAuth";
import { axiosPrivate } from "api/axiosInstance";

const getUserInfo = async () => {
  const url = "/users/me";

  const response = await axiosPrivate.get(url);

  console.log(response.data);
};

const HomePage = () => {
  const { logout } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Bienvenue</h1>
      <button onClick={() => logout()}>Déconnexion</button>
      <button onClick={() => getUserInfo()}>Me</button>
    </div>
  );
};

export default HomePage;
