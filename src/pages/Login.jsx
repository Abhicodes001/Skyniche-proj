import { useState } from "react";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password, rememberMe });
  };

  return (
    <div className="auth-container">
      <div className="login-card">
        {/* Header Section */}
        <div className="card-header">
          <div className="logo-section">
            <div className="logo-icon">⚡</div>
            <span className="logo-text">Aurora</span>
          </div>
          <span className="sign-in-badge">SIGN IN</span>
        </div>

        {/* Content Section */}
        <div className="card-content">
          <h2 className="welcome-heading">Welcome back</h2>
          <p className="welcome-subtitle">
            Enter your credentials to access your dashboard.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Input */}
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper password-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="remember-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <span>Remember me</span>
              </label>
              <a href="/forgot-password" className="forgot-link">
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button type="submit" className="sign-in-btn">
              Sign in
              <span className="btn-icon">→</span>
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="social-divider">
            <span>or continue with</span>
          </div>

          {/* Social Login Buttons */}
          <div className="social-buttons">
            <button className="social-btn google-btn">
              <span className="social-icon">🔵</span>
              Google
            </button>
            <button className="social-btn github-btn">
              <span className="social-icon">⬛</span>
              GitHub
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="signup-prompt">
            Don't have an account?
            <a href="/signup" className="signup-link">
              Create one
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
