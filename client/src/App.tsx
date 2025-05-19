import { ToastContainer } from "react-toastify";

import { AccountProvider } from "@/contexts/AccountContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleBasedProvider } from "@/contexts/RoleBasedProvider";
import Router from "@/router/index";

import "react-toastify/dist/ReactToastify.css";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <AccountProvider>
        <RoleBasedProvider>
          <Router />
          <ToastContainer position="top-center" theme="light" autoClose={3000} />
        </RoleBasedProvider>
      </AccountProvider>
    </AuthProvider>
  );
}

export default App;
