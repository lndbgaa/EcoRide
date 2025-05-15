import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import Router from "@/router/index";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <Router />
        <ToastContainer position="top-center" theme="light" autoClose={3000} />
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
