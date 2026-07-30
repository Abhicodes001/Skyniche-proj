import { useState, useEffect } from "react";
import UserAuth from "./pages/UserAuth";
import AdminAuth from "./pages/AdminAuth";
import Dashboard from "./pages/Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [portalMode, setPortalMode] = useState("user_auth"); // 'user_auth' | 'admin_auth'

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Sync Dark Mode state with document body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

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
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleDarkMode}
      />
    );
  }

  if (portalMode === "admin_auth") {
    return (
      <AdminAuth
        onSuccess={handleLoginSuccess}
        onSwitchToUser={() => setPortalMode("user_auth")}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleDarkMode}
      />
    );
  }

  return (
    <UserAuth
      onSuccess={handleLoginSuccess}
      onSwitchToAdmin={() => setPortalMode("admin_auth")}
      isDarkMode={isDarkMode}
      onToggleTheme={toggleDarkMode}
    />
  );
}

export default App;

