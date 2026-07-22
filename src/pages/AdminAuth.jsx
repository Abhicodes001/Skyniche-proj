import { useState } from "react";
import "../styles/Login.css";

function AdminAuth({ onSuccess, onSwitchToUser }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

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
    <div className="auth-wrapper" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)" }}>
      <div className="auth-card" style={{ borderColor: "#ef4444", boxShadow: "0 20px 40px rgba(239, 68, 68, 0.15)" }}>
        {/* Portal Switch Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: "12px", fontWeight: "bold", color: "#ef4444" }}>🛡️ ADMINISTRATOR PORTAL</span>
          <button
            type="button"
            onClick={onSwitchToUser}
            style={{
              background: "var(--primary-light)",
              color: "var(--primary)",
              border: "1px solid var(--border)",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            👤 Switch to User Login
          </button>
        </div>

        {/* Admin Brand Header */}
        <div className="auth-header">
          <div className="auth-brand">
            <div className="brand-icon" style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}>🔑</div>
            <span className="brand-title">PortalX Admin</span>
          </div>
          <h2 className="auth-welcome" style={{ color: "var(--text-main)" }}>
            Admin Access
          </h2>
          <p className="auth-subtitle">
            Sign in with authorized administrator credentials
          </p>
        </div>

        {/* Alert Notification */}
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
              <span className="field-icon">🛡️</span>
              <input
                type="email"
                className="input-field"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Admin Security Password</label>
            <div className="input-box">
              <span className="field-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                className="input-field"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
            style={{ background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)", boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)" }}
          >
            {loading ? "Authenticating Admin..." : "Authenticate Admin Access →"}
          </button>
        </form>

        {/* Admin Credentials Hint */}
        <div className="demo-hint" style={{ marginTop: "20px", background: "#fee2e2", borderColor: "rgba(239,68,68,0.3)", color: "#991b1b" }}>
          <span>💡 <strong>Default Admin Account:</strong></span>
          <span>Email: <code>admin@example.com</code> | Pass: <code>admin123</code></span>
        </div>
      </div>
    </div>
  );
}

export default AdminAuth;
