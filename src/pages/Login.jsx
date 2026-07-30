import { useState } from "react";
import { Modal } from "../components/Modal";
import "../styles/Login.css";

function Login({ onSuccess }) {
  const [activeTab, setActiveTab] = useState("login"); // 'login' or 'register'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'error' | 'success', message: '' }

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const fillAdminDemo = () => {
    setEmail("admin@example.com");
    setPassword("admin123");
    setAlert({ type: "success", message: "Admin credentials pre-filled!" });
  };

  const fillUserDemo = () => {
    setEmail("demo@example.com");
    setPassword("password123");
    setAlert({ type: "success", message: "User credentials pre-filled!" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!email || !password) {
      setAlert({ type: "error", message: "Please enter your email and password." });
      return;
    }

    if (activeTab === "register" && !name) {
      setAlert({ type: "error", message: "Please enter your full name." });
      return;
    }

    setLoading(true);

    try {
      const endpoint = activeTab === "login"
        ? "http://localhost:4000/login"
        : "http://localhost:4000/signup";

      const payload = activeTab === "login"
        ? { email, password }
        : { name, email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && (data.status === 1 || data.user)) {
        const userObj = data.user || { name: name || email.split("@")[0], email, role: email.includes("admin") ? "admin" : "user" };
        
        if (rememberMe) {
          localStorage.setItem("user_session", JSON.stringify(userObj));
        }

        setAlert({ type: "success", message: `Authentication successful! Logging in as ${userObj.role.toUpperCase()}...` });
        setTimeout(() => onSuccess(userObj), 600);
      } else {
        // Real validation error from server (e.g. Invalid password, User already exists)
        const errorMsg = data.error || data.message || "Invalid email or password. Access denied.";
        setAlert({ type: "error", message: `❌ ${errorMsg}` });
      }
    } catch (err) {
      setAlert({ type: "error", message: "❌ Backend server unreachable. Please start backend server on port 4000." });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    const socialUser = {
      name: `${provider} User`,
      email: `user@${provider.toLowerCase()}.com`,
      role: "user",
      provider
    };
    if (rememberMe) {
      localStorage.setItem("user_session", JSON.stringify(socialUser));
    }
    setAlert({ type: "success", message: `Authenticated with ${provider}!` });
    setTimeout(() => onSuccess(socialUser), 600);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitted(true);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-brand">
            <div className="brand-icon">⚡</div>
            <span className="brand-title">PortalX</span>
          </div>
          <h2 className="auth-welcome">
            {activeTab === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="auth-subtitle">
            {activeTab === "login"
              ? "Sign in to access your account dashboard"
              : "Register to join the platform"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => { setActiveTab("login"); setAlert(null); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
            onClick={() => { setActiveTab("register"); setAlert(null); }}
          >
            Register
          </button>
        </div>

        {/* Alert Notification */}
        {alert && (
          <div className={`auth-alert ${alert.type}`}>
            <span>{alert.type === "error" ? "⚠️" : "✅"}</span>
            {alert.message}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {activeTab === "register" && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-box">
                <span className="field-icon">👤</span>
                <input
                  type="text"
                  className="input-field"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-box">
              <span className="field-icon">✉️</span>
              <input
                type="email"
                className="input-field"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Password</span>
              {activeTab === "login" && (
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "12px", cursor: "pointer" }}
                  onClick={() => { setForgotModalOpen(true); setForgotSubmitted(false); setForgotEmail(email); }}
                >
                  Forgot?
                </button>
              )}
            </label>
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

          {activeTab === "login" && (
            <div className="form-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me on this device
              </label>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Verifying..." : activeTab === "login" ? "Sign In →" : "Register Account →"}
          </button>
        </form>

        {/* Quick Demo Pre-fill Options */}
        <div className="demo-hint">
          <span>💡 <strong>Quick Login Presets:</strong></span>
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button
              type="button"
              onClick={fillAdminDemo}
              className="demo-preset-btn"
            >
              🔑 Fill Admin (`admin@example.com`)
            </button>
            <button
              type="button"
              onClick={fillUserDemo}
              className="demo-preset-btn"
            >
              👤 Fill User (`demo@example.com`)
            </button>
          </div>
        </div>

        {/* Social Options */}
        <div className="divider">
          <span>or continue with</span>
        </div>

        <div className="social-grid">
          <button type="button" className="social-button" onClick={() => handleSocialLogin("Google")}>
            <span>🔵</span> Google
          </button>
          <button type="button" className="social-button" onClick={() => handleSocialLogin("GitHub")}>
            <span>⬛</span> GitHub
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Your Password"
      >
        {!forgotSubmitted ? (
          <form onSubmit={handleForgotSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
              Enter your email address and we will send instructions to reset your password.
            </p>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="name@company.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                style={{ paddingLeft: "14px" }}
              />
            </div>
            <button type="submit" className="submit-btn">
              Send Reset Instructions
            </button>
          </form>
        ) : (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>📩</div>
            <h4 style={{ fontSize: "16px", marginBottom: "8px" }}>Check Your Inbox</h4>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>
              Password reset instructions sent to <strong>{forgotEmail}</strong>.
            </p>
            <button
              type="button"
              className="submit-btn"
              onClick={() => setForgotModalOpen(false)}
            >
              Done
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Login;
