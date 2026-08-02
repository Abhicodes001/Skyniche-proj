import { useState, useEffect } from "react";
import { Modal } from "../components/Modal";
import "../styles/Login.css";

function UserAuth({ onSuccess, onSwitchToAdmin, isDarkMode, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState("login"); // 'login' or 'register'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const [selectedRole, setSelectedRole] = useState("viewer"); // 'viewer' | 'editor' | 'admin'

  // Registered emails & roles memory for client validation fallback
  const [registeredUsers, setRegisteredUsers] = useState([
    { email: "viewer@example.com", role: "viewer", user_type: 3 },
    { email: "editor@example.com", role: "editor", user_type: 2 },
    { email: "admin@example.com", role: "admin", user_type: 1 },
    { email: "demo@example.com", role: "viewer", user_type: 3 }
  ]);

  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

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
      setAlert({ type: "error", message: "Please enter your email and password." });
      return;
    }

    if (activeTab === "register" && !name) {
      setAlert({ type: "error", message: "Please enter your full name to register." });
      return;
    }

    setLoading(true);

    try {
      if (activeTab === "login") {
        const knownUserObj = registeredUsers.find(u =>
          typeof u === "string" ? u === email.toLowerCase() : u.email === email.toLowerCase()
        );
        const isKnownUser = !!knownUserObj || email === "demo@example.com";

        // Try backend login API
        const response = await fetch("http://localhost:4000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }).catch(() => null);

        if (response && response.ok) {
          const data = await response.json();
          const roleFromBackend = data.user?.role || (knownUserObj && knownUserObj.role) || (email.includes("admin") ? "admin" : email.includes("editor") ? "editor" : "viewer");
          const userTypeFromBackend = data.user?.user_type || (roleFromBackend === "admin" ? 1 : roleFromBackend === "editor" ? 2 : 3);
          
          const userObj = {
            id: data.user?.id,
            name: data.user?.name || email.split("@")[0],
            email: data.user?.email || email,
            role: roleFromBackend,
            user_type: userTypeFromBackend
          };

          if (rememberMe) localStorage.setItem("user_session", JSON.stringify(userObj));
          setAlert({ type: "success", message: `Login successful! Accessing Dashboard as ${userObj.role.toUpperCase()}...` });
          setTimeout(() => onSuccess(userObj), 600);
          return;
        }

        // If server responded with 401 or backend offline: Check registration status
        if (response && response.status === 401) {
          const errData = await response.json().catch(() => ({}));
          setAlert({ type: "error", message: `❌ ${errData.error || "Invalid password for registered account."}` });
          return;
        }

        // Local verification check
        if (!isKnownUser && !email.includes("demo")) {
          setAlert({
            type: "error",
            message: "❌ User is not registered! Access denied. Please click the 'Register' tab to create an account first."
          });
          return;
        }

        // Fallback for registered local user
        const localRole = (knownUserObj && knownUserObj.role) || (email.includes("admin") ? "admin" : email.includes("editor") ? "editor" : "viewer");
        const localUserType = localRole === "admin" ? 1 : localRole === "editor" ? 2 : 3;
        const userObj = { name: email.split("@")[0], email, role: localRole, user_type: localUserType };
        if (rememberMe) localStorage.setItem("user_session", JSON.stringify(userObj));
        setAlert({ type: "success", message: `Login successful! Opening dashboard as ${localRole.toUpperCase()}...` });
        setTimeout(() => onSuccess(userObj), 600);

      } else {
        // REGISTER TAB
        const userTypeToRegister = selectedRole === "admin" ? 1 : selectedRole === "editor" ? 2 : 3;
        const response = await fetch("http://localhost:4000/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role: selectedRole, user_type: userTypeToRegister }),
        }).catch(() => null);

        const newRegObj = { email: email.toLowerCase(), role: selectedRole, user_type: userTypeToRegister };
        setRegisteredUsers(prev => [...prev, newRegObj]);

        if (response && response.ok) {
          setAlert({ type: "success", message: `✅ Registration successful as ${selectedRole.toUpperCase()}! Please Sign In now.` });
          setActiveTab("login");
          return;
        }

        // Add to local registered users list fallback
        setAlert({ type: "success", message: `✅ Account registered as ${selectedRole.toUpperCase()}! Please Sign In now.` });
        setActiveTab("login");
      }
    } catch (err) {
      setAlert({ type: "error", message: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Dynamic Floating Blobs */}
      <div className="glowing-blobs-container">
        <div className="glowing-blob blob-1"></div>
        <div className="glowing-blob blob-2"></div>
        <div className="glowing-blob blob-3"></div>
      </div>

      <div className="auth-container">
        {/* Left Side: Scrollytelling Features Showcase */}
        <div className="auth-promo-panel">
          <div className="promo-header">
            <div className="promo-brand-icon">⚡</div>
            <span className="promo-brand-name">PortalX</span>
          </div>

          <div className="scrollytelling-slider">
            <div className={`scrolly-slide ${slideIndex === 0 ? "active" : ""}`}>
              <h3>Interactive Performance Telemetry</h3>
              <p>
                Track live API response metrics, query resolution times, and network throughput charts 
                dynamically built in our custom analytics control panel.
              </p>
            </div>
            <div className={`scrolly-slide ${slideIndex === 1 ? "active" : ""}`}>
              <h3>Advanced User Administration</h3>
              <p>
                Administrators can filter, update, and manage accounts securely from a streamlined 
                directory board synced with backend schemas.
              </p>
            </div>
            <div className={`scrolly-slide ${slideIndex === 2 ? "active" : ""}`}>
              <h3>Integrated SQL Database</h3>
              <p>
                Integrated with persistent MySQL databases to store sessions, profile settings, and 
                system logs securely with automated backup utilities.
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
            &copy; 2026 PortalX Inc. All rights reserved.
          </div>
        </div>

        {/* Right Side: Glassmorphism Card */}
        <div className="auth-form-panel">
          <div className="auth-card">
            {/* Portal Switch & Theme Header */}
            <div className="portal-switch-header">
              <span className="portal-label portal-label-user">👤 USER PORTAL</span>
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
                  onClick={onSwitchToAdmin}
                >
                  🔑 Switch to Admin
                </button>
              </div>
            </div>

            {/* Welcome Text */}
            <h2 className="auth-welcome">
              {activeTab === "login" ? "User Sign In" : "User Registration"}
            </h2>
            <p className="auth-subtitle">
              {activeTab === "login"
                ? "Sign in with your registered account"
                : "Create a new user account to get access"}
            </p>

            {/* Modern Tab Switcher */}
            <div className="auth-tabs">
              <div className={`tab-indicator ${activeTab === "register" ? "register-active" : ""}`}></div>
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

            {/* Alert Banner */}
            {alert && (
              <div className={`auth-alert ${alert.type}`}>
                <span>{alert.type === "error" ? "⚠️" : "✅"}</span>
                {alert.message}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {activeTab === "register" && (
                <>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="input-box">
                      <input
                        type="text"
                        className="input-field"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                      <span className="field-icon">👤</span>
                    </div>
                  </div>

                  <div className="role-selector-container">
                    <label className="form-label">Select Account Role & Permissions</label>
                    <div className="role-selector-grid">
                      <div
                        className={`role-option-card ${selectedRole === "viewer" ? "active-viewer" : ""}`}
                        onClick={() => setSelectedRole("viewer")}
                      >
                        <span className="role-option-title">👁️ Viewer</span>
                        <span className="role-option-desc">Read-Only</span>
                      </div>

                      <div
                        className={`role-option-card ${selectedRole === "editor" ? "active-editor" : ""}`}
                        onClick={() => setSelectedRole("editor")}
                      >
                        <span className="role-option-title">✏️ Editor</span>
                        <span className="role-option-desc">Add & Edit</span>
                      </div>

                      <div
                        className={`role-option-card ${selectedRole === "admin" ? "active-admin" : ""}`}
                        onClick={() => setSelectedRole("admin")}
                      >
                        <span className="role-option-title">⚡ Admin</span>
                        <span className="role-option-desc">Full Control</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-box">
                  <input
                    type="email"
                    className="input-field"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <span className="field-icon">✉️</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Password</span>
                  {activeTab === "login" && (
                    <button
                      type="button"
                      className="forgot-link"
                      onClick={() => { setForgotModalOpen(true); setForgotSubmitted(false); setForgotEmail(email); }}
                    >
                      Forgot Password?
                    </button>
                  )}
                </label>
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
                {loading ? "Processing..." : activeTab === "login" ? "Sign In →" : "Register Account →"}
              </button>
            </form>

            {/* Demo Credentials Hint */}
            {activeTab === "login" && (
              <div className="demo-hint">
                <span>💡 <strong>Demo Accounts:</strong></span>
                <span>👁️ Viewer: <code>viewer@example.com</code> | <code>password123</code></span>
                <span>✏️ Editor: <code>editor@example.com</code> | <code>password123</code></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Password"
      >
        {!forgotSubmitted ? (
          <form onSubmit={(e) => { e.preventDefault(); setForgotSubmitted(true); }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
              Enter your email to receive password reset instructions.
            </p>
            <input
              type="email"
              className="input-field"
              placeholder="user@example.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              style={{ paddingLeft: "14px" }}
            />
            <button type="submit" className="submit-btn">Send Reset Link</button>
          </form>
        ) : (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <h4>Reset Instructions Sent!</h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "10px 0" }}>
              Check <strong>{forgotEmail}</strong> for instructions.
            </p>
            <button type="button" className="submit-btn" onClick={() => setForgotModalOpen(false)}>Done</button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default UserAuth;
