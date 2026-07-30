import { useState, useEffect } from "react";
import "../styles/Login.css";

function AdminAuth({ onSuccess, onSwitchToUser, isDarkMode, onToggleTheme }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Scrollytelling active slide state
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!email || !password) {
      setAlert({ type: "error", message: "Please enter Admin Email and Password." });
      return;
    }

    setLoading(true);

    try {
      // Call backend login API
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).catch(() => null);

      if (response && response.ok) {
        const data = await response.json();
        const userObj = data.user || { name: "System Admin", email, role: "admin", user_type: 1 };

        if (userObj.role !== "admin" && userObj.user_type !== 1 && !email.includes("admin")) {
          setAlert({ type: "error", message: "❌ Access Denied! This account does not have Administrator privileges." });
          setLoading(false);
          return;
        }

        localStorage.setItem("user_session", JSON.stringify(userObj));
        setAlert({ type: "success", message: "✅ Admin Authentication Verified! Opening Admin Control Center..." });
        setTimeout(() => onSuccess(userObj), 600);
        return;
      }

      // Check if invalid credentials
      if (response && response.status === 401) {
        setAlert({ type: "error", message: "❌ Access Denied! Invalid Admin credentials." });
        setLoading(false);
        return;
      }

      // Verification fallback for admin demo
      if (email === "admin@example.com" && password === "admin123") {
        const adminObj = { name: "System Admin", email, role: "admin", user_type: 1 };
        localStorage.setItem("user_session", JSON.stringify(adminObj));
        setAlert({ type: "success", message: "✅ Admin Authenticated! Launching Admin Panel..." });
        setTimeout(() => onSuccess(adminObj), 600);
      } else {
        setAlert({ type: "error", message: "❌ Invalid Admin Email or Password. Access Denied." });
      }
    } catch (err) {
      setAlert({ type: "error", message: "Error connecting to server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper admin-theme">
      {/* Dynamic Floating Blobs */}
      <div className="glowing-blobs-container">
        <div className="glowing-blob blob-1"></div>
        <div className="glowing-blob blob-2"></div>
        <div className="glowing-blob blob-3"></div>
      </div>

      <div className="auth-container">
        {/* Left Side: Scrollytelling Showcase */}
        <div className="auth-promo-panel">
          <div className="promo-header">
            <div className="promo-brand-icon">🔑</div>
            <span className="promo-brand-name">PortalX Admin</span>
          </div>

          <div className="scrollytelling-slider">
            <div className={`scrolly-slide ${slideIndex === 0 ? "active" : ""}`}>
              <h3>Administrative Authority Control</h3>
              <p>
                Configure roles, inspect database registries, and execute clean synchronization protocols 
                on all user fields safely.
              </p>
            </div>
            <div className={`scrolly-slide ${slideIndex === 1 ? "active" : ""}`}>
              <h3>Secure Administrative Auditing</h3>
              <p>
                Track health parameters, review endpoint latency breakdown lists, and inspect secure SQL 
                audit streams from the cockpit.
              </p>
            </div>
            <div className={`scrolly-slide ${slideIndex === 2 ? "active" : ""}`}>
              <h3>Data Export & Sync Utilities</h3>
              <p>
                Generate spreadsheet logs for user profiles, review active connection pools, and manage 
                server states cleanly.
              </p>
            </div>

            <div className="scrolly-indicators">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`indicator-dot ${slideIndex === idx ? "active" : ""}`}
                  onClick={() => setSlideIndex(idx)}
                ></div>
              ))}
            </div>
          </div>

          <div className="promo-footer">
            &copy; 2026 PortalX Admin Panel. Confined area.
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="auth-form-panel">
          <div className="auth-card">
            {/* Portal Switch & Theme Header */}
            <div className="portal-switch-header">
              <span className="portal-label portal-label-admin">🛡️ ADMINISTRATOR PORTAL</span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  type="button"
                  className="theme-toggle-btn"
                  onClick={onToggleTheme}
                  title="Toggle Light / Dark Theme"
                >
                  {isDarkMode ? "☀️ Light" : "🌙 Dark"}
                </button>
                <button
                  type="button"
                  className="portal-switch-btn"
                  onClick={onSwitchToUser}
                >
                  👤 Switch to User
                </button>
              </div>
            </div>

            {/* Welcome Text */}
            <h2 className="auth-welcome">Admin Access</h2>
            <p className="auth-subtitle">Sign in with authorized administrator credentials</p>

            {/* Alert Banner */}
            {alert && (
              <div className={`auth-alert ${alert.type}`}>
                <span>{alert.type === "error" ? "⚠️" : "✅"}</span>
                {alert.message}
              </div>
            )}

            {/* Admin Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Admin Email</label>
                <div className="input-box">
                  <input
                    type="email"
                    className="input-field"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <span className="field-icon">🛡️</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Admin Security Password</label>
                <div className="input-box">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span className="field-icon">🔒</span>
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Authenticating Admin..." : "Authenticate Admin Access →"}
              </button>
            </form>

            {/* Admin Credentials Hint */}
            <div className="demo-hint">
              <span>💡 <strong>Default Admin Account:</strong></span>
              <span>Email: <code>admin@example.com</code> | Pass: <code>admin123</code></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAuth;
