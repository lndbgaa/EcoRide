import { AuthProvider } from "@/contexts/AuthContext";
import Router from "@/router/index";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
