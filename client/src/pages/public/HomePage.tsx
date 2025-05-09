import useAuth from "@/hooks/useAuth";

const HomePage = () => {
  const { logout } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Bienvenue</h1>
      <button onClick={() => logout()}>Déconnexion</button>
    </div>
  );
};

export default HomePage;
