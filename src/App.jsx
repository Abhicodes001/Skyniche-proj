import { useState, useEffect } from "react";
import UserAuth from "./pages/UserAuth";
import AdminAuth from "./pages/AdminAuth";
import Dashboard from "./pages/Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [portalMode, setPortalMode] = useState("user_auth"); // 'user_auth' | 'admin_auth'

  // Restore session if remember me was saved
  useEffect(() => {
    const saved = localStorage.getItem("user_session");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem("user_session");
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleUpdateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    setUser(null);
    setPortalMode("user_auth");
  };

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
  }

  if (portalMode === "admin_auth") {
    return (
      <AdminAuth
        onSuccess={handleLoginSuccess}
        onSwitchToUser={() => setPortalMode("user_auth")}
      />
    );
  }

  return (
    <UserAuth
      onSuccess={handleLoginSuccess}
      onSwitchToAdmin={() => setPortalMode("admin_auth")}
    />
  );
}

export default App;
