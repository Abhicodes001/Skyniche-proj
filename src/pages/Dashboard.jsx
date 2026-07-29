import { useState, useEffect } from "react";
import { Modal, Toast } from "../components/Modal";
import "../styles/Dashboard.css";

function Dashboard({ user, onLogout, onUpdateUser }) {
  const isAdmin = user?.role === "admin" || user?.user_type === 1 || user?.email?.includes("admin");

  // Navigation & UI State
  const [activeMenu, setActiveMenu] = useState(isAdmin ? "admin" : "overview");
  const [timeframe, setTimeframe] = useState("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  // Modals
  const [createReportModalOpen, setCreateReportModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportCategory, setReportCategory] = useState("Analytics");
  const [reportNotes, setReportNotes] = useState("");

  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("password123");
  const [newMemberRole, setNewMemberRole] = useState("user");
  const [newMemberStatus, setNewMemberStatus] = useState(1);

  // Edit User Modal State (Admin)
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [userStatusFilter, setUserStatusFilter] = useState("All");

  // Settings Form State
  const [profileName, setProfileName] = useState(user?.name || "User");
  const [profileEmail, setProfileEmail] = useState(user?.email || "user@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Performance Analytics state
  const [analyticsTab, setAnalyticsTab] = useState("latency"); // 'latency' | 'volume' | 'errors'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Data Lists
  const [teamMembers, setTeamMembers] = useState(() => {
    const saved = localStorage.getItem("app_team_members");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { id: 1, name: "System Admin", email: "admin@example.com", role: "admin", status: 1, date: "System" },
      { id: 2, name: "Demo User", email: "demo@example.com", role: "user", status: 1, date: "Today" },
    ];
  });

  useEffect(() => {
    localStorage.setItem("app_team_members", JSON.stringify(teamMembers));
  }, [teamMembers]);

  const [reports, setReports] = useState([
    { id: 1, title: "Q2 Financial Growth", category: "Finance", date: "2026-07-01", author: "Admin" },
    { id: 2, title: "User Acquisition Metrics", category: "Analytics", date: "2026-07-15", author: "Team" }
  ]);

  const [activityFeed, setActivityFeed] = useState([
    { id: 1, text: "Database connection active", time: "Just now", color: "var(--primary)" },
    { id: 2, text: `Logged in as ${isAdmin ? "Admin" : "Standard User"}`, time: "1 minute ago", color: "var(--success)" },
  ]);

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

  // Fetch users from backend DB when admin views users or admin panel
  const fetchUsersFromBackend = async () => {
    try {
      const res = await fetch("http://localhost:4000/webservices/users/get-all-users", {
        method: "GET"
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 1 && Array.isArray(data.data) && data.data.length > 0) {
          setTeamMembers(data.data.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role || (u.user_type === 1 ? "admin" : "user"),
            status: Number(u.status),
            date: u.timestamp ? new Date(u.timestamp * 1000).toLocaleDateString() : "Active"
          })));
        }
      }
    } catch (e) {
      // Keep existing list if backend unreachable
    }
  };

  useEffect(() => {
    fetchUsersFromBackend();
  }, [activeMenu]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // CSV Exporter
  const exportCSV = () => {
    const headers = "ID,Name,Email,Role,Status\n";
    const rows = teamMembers.map(m => `${m.id},"${m.name}","${m.email}",${m.role},${m.status === 1 ? "Active" : "Inactive"}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `database_users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast("User dataset exported to CSV!");
  };

  // Handle Add Member Submit (Calls Backend API & Updates UI Fast)
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;

    const tempId = Date.now();
    const newLocalUser = {
      id: tempId,
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      role: newMemberRole,
      status: Number(newMemberStatus),
      date: "Just now"
    };

    // 1. Immediately update UI state so user sees addition instantly
    setTeamMembers((prev) => [newLocalUser, ...prev]);
    showToast(`✅ Created user ${newMemberName}!`);
    setNewMemberName("");
    setNewMemberEmail("");
    setAddMemberModalOpen(false);

    // 2. Sync to Backend DB
    try {
      const res = await fetch("http://localhost:4000/webservices/users/add-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newLocalUser.name,
          email: newLocalUser.email,
          password: newMemberPassword || "password123",
          role: newLocalUser.role,
          user_type: newLocalUser.role === "admin" ? 1 : 3,
          status: newLocalUser.status
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status === 1) {
        if (data.user_id) {
          setTeamMembers((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, id: data.user_id } : m))
          );
        }
        fetchUsersFromBackend();
      }
    } catch (err) {
      console.warn("Backend offline, saved user locally:", err);
    }
  };

  // Handle Edit User Submit (Admin)
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const updated = { ...editingUser };
    setTeamMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
    showToast(`Updated user details for ${updated.name}`);
    setEditUserModalOpen(false);
    setEditingUser(null);

    try {
      const res = await fetch("http://localhost:4000/webservices/users/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          user_type: updated.role === "admin" ? 1 : 3,
          status: updated.status
        })
      });
      if (res.ok) {
        fetchUsersFromBackend();
      }
    } catch (err) {
      console.warn("Backend offline during edit:", err);
    }
  };

  const handleDeleteMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;

    setTeamMembers(prev => prev.filter(m => m.id !== id));
    showToast(`Deleted user "${name}"`, "info");

    try {
      await fetch("http://localhost:4000/webservices/users/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
    } catch {
      // already removed locally
    }
  };

  // Handle Profile Save
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({ name: profileName, email: profileEmail });
    }
    const updated = { ...user, name: profileName, email: profileEmail };
    localStorage.setItem("user_session", JSON.stringify(updated));
    showToast("Profile settings saved!");
  };

  const initials = profileName.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";

  // Filtered members list
  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = userStatusFilter === "All" || 
                          (userStatusFilter === "Active" && member.status === 1) ||
                          (userStatusFilter === "Inactive" && member.status !== 1);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-container">
      {/* Toast Notification Banner */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-icon">⚡</div>
          <div>
            <span className="sidebar-brand-name">PortalX</span>
            {isAdmin && <div style={{ fontSize: "10px", fontWeight: "bold", color: "var(--primary)", letterSpacing: "1px" }}>ADMIN CONTROL</div>}
          </div>
        </div>

        <nav className="sidebar-menu">
          {isAdmin && (
            <button
              type="button"
              className={`menu-item ${activeMenu === "admin" ? "active" : ""}`}
              onClick={() => setActiveMenu("admin")}
              style={{ background: activeMenu === "admin" ? "var(--primary-light)" : "transparent", fontWeight: "bold" }}
            >
              <span>🔑</span> Admin Control Center
            </button>
          )}

          <button
            type="button"
            className={`menu-item ${activeMenu === "overview" ? "active" : ""}`}
            onClick={() => setActiveMenu("overview")}
          >
            <span>📊</span> Overview
          </button>
          <button
            type="button"
            className={`menu-item ${activeMenu === "analytics" ? "active" : ""}`}
            onClick={() => setActiveMenu("analytics")}
          >
            <span>📈</span> Analytics
          </button>
          <button
            type="button"
            className={`menu-item ${activeMenu === "users" ? "active" : ""}`}
            onClick={() => setActiveMenu("users")}
          >
            <span>👥</span> Users Management
          </button>
          <button
            type="button"
            className={`menu-item ${activeMenu === "settings" ? "active" : ""}`}
            onClick={() => setActiveMenu("settings")}
          >
            <span>⚙️</span> Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="logout-button" onClick={onLogout}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-content">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search users, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="user-profile">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Light/Dark Theme"
            >
              {isDarkMode ? "☀️ Light" : "🌙 Dark"}
            </button>

            <div className="avatar" style={{ background: isAdmin ? "#ef4444" : "var(--primary)" }}>{initials}</div>
            <div className="user-info">
              <span className="user-name">
                {profileName} {isAdmin && <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: "bold" }}>(ADMIN)</span>}
              </span>
              <span className="user-role">{profileEmail}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Views */}
        <main className="dashboard-view">
          {/* Header Controls */}
          <div className="view-header">
            <div>
              <h1 className="view-title">
                {activeMenu === "admin" && "👑 Admin Control Center"}
                {activeMenu === "overview" && "Dashboard Overview"}
                {activeMenu === "analytics" && "Analytics & Performance"}
                {activeMenu === "users" && "User & Team Management"}
                {activeMenu === "settings" && "Account & System Settings"}
              </h1>
              <p className="view-subtitle">
                Welcome back, {profileName}! {isAdmin ? "You have Full Administrative Access to manage users & database." : "Standard Member Dashboard."}
              </p>
            </div>

            <div className="header-actions">
              {(activeMenu === "admin" || activeMenu === "users") && (
                <>
                  <button type="button" className="secondary-btn" onClick={exportCSV}>
                    📥 Export CSV
                  </button>
                  <button type="button" className="action-btn" onClick={() => setAddMemberModalOpen(true)}>
                    <span>+</span> Add New User
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ADMIN CONTROL CENTER VIEW */}
          {activeMenu === "admin" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Database Users</span>
                    <div className="stat-icon blue">👥</div>
                  </div>
                  <div className="stat-value">{teamMembers.length}</div>
                  <span className="stat-badge positive">Registered in MySQL</span>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Admin Accounts</span>
                    <div className="stat-icon purple">🔑</div>
                  </div>
                  <div className="stat-value">{teamMembers.filter(m => m.role === "admin").length}</div>
                  <span className="stat-badge positive">Superusers</span>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Active Status</span>
                    <div className="stat-icon green">⚡</div>
                  </div>
                  <div className="stat-value">{teamMembers.filter(m => m.status === 1).length}</div>
                  <span className="stat-badge positive">Active accounts</span>
                </div>
              </div>

              {/* Admin Table */}
              <div className="card">
                <div className="card-title" style={{ flexWrap: "wrap", gap: "12px" }}>
                  <span>Admin User Management Table</span>
                  
                  <div style={{ display: "flex", gap: "10px" }}>
                    <select
                      className="filter-select"
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active Only</option>
                      <option value="Inactive">Inactive Only</option>
                    </select>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name & Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Date Added</th>
                        <th>Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((m) => (
                        <tr key={m.id}>
                          <td><strong>#{m.id}</strong></td>
                          <td>
                            <strong>{m.name}</strong>
                            <br />
                            <small style={{ color: "var(--text-light)" }}>{m.email}</small>
                          </td>
                          <td>
                            <span style={{
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "bold",
                              background: m.role === "admin" ? "#fee2e2" : "var(--primary-light)",
                              color: m.role === "admin" ? "#ef4444" : "var(--primary)"
                            }}>
                              {m.role ? m.role.toUpperCase() : "USER"}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${m.status === 1 ? "active" : "offline"}`}>
                              {m.status === 1 ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>{m.date}</td>
                          <td>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                type="button"
                                className="action-icon-btn"
                                onClick={() => { setEditingUser({ ...m }); setEditUserModalOpen(true); }}
                                style={{ color: "var(--primary)" }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                type="button"
                                className="action-icon-btn"
                                onClick={() => handleDeleteMember(m.id, m.name)}
                                style={{ color: "#ef4444" }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* OVERVIEW VIEW */}
          {activeMenu === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-title">Monthly Revenue</span>
                  <div className="stat-value">$28,450</div>
                  <span className="stat-badge positive">+14% vs last month</span>
                </div>
                <div className="stat-card">
                  <span className="stat-title">Active Platform Users</span>
                  <div className="stat-value">{teamMembers.length}</div>
                  <span className="stat-badge positive">+8% growth</span>
                </div>
                <div className="stat-card">
                  <span className="stat-title">System Uptime</span>
                  <div className="stat-value">99.9%</div>
                  <span className="stat-badge positive">Healthy</span>
                </div>
              </div>

              <div className="content-grid">
                <div className="card">
                  <div className="card-title">Recent Platform Members</div>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Role</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamMembers.slice(0, 5).map((m) => (
                          <tr key={m.id}>
                            <td>{m.name} <br/><small>{m.email}</small></td>
                            <td>{m.role}</td>
                            <td><span className={`badge ${m.status === 1 ? "active" : "offline"}`}>{m.status === 1 ? "Active" : "Inactive"}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">System Audit Log</div>
                  <div className="activity-feed">
                    {activityFeed.map((act) => (
                      <div key={act.id} className="activity-item">
                        <div className="activity-dot" style={{ background: act.color }}></div>
                        <div>
                          <p className="activity-text">{act.text}</p>
                          <span className="activity-time">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS VIEW */}
          {activeMenu === "analytics" && (() => {
            const performanceData = {
              latency: {
                title: "API Response Time",
                unit: "ms",
                color: "#6366f1",
                avg: "58 ms",
                peak: "89 ms",
                status: "Optimal",
                maxVal: 100,
                gridValues: [0, 25, 50, 75, 100],
                points: [
                  { time: "12:00 PM", value: 42 },
                  { time: "01:00 PM", value: 55 },
                  { time: "02:00 PM", value: 89 },
                  { time: "03:00 PM", value: 48 },
                  { time: "04:00 PM", value: 62 },
                  { time: "05:00 PM", value: 45 }
                ]
              },
              volume: {
                title: "Request Volume",
                unit: " rpm",
                color: "#10b981",
                avg: "186 rpm",
                peak: "310 rpm",
                status: "High Traffic",
                maxVal: 400,
                gridValues: [0, 100, 200, 300, 400],
                points: [
                  { time: "12:00 PM", value: 120 },
                  { time: "01:00 PM", value: 180 },
                  { time: "02:00 PM", value: 310 },
                  { time: "03:00 PM", value: 140 },
                  { time: "04:00 PM", value: 210 },
                  { time: "05:00 PM", value: 160 }
                ]
              },
              errors: {
                title: "HTTP Error Rate",
                unit: "%",
                color: "#ef4444",
                avg: "0.36%",
                peak: "1.50%",
                status: "Healthy",
                maxVal: 2.0,
                gridValues: [0, 0.5, 1.0, 1.5, 2.0],
                points: [
                  { time: "12:00 PM", value: 0.1 },
                  { time: "01:00 PM", value: 0.2 },
                  { time: "02:00 PM", value: 1.5 },
                  { time: "03:00 PM", value: 0.3 },
                  { time: "04:00 PM", value: 0.1 },
                  { time: "05:00 PM", value: 0.0 }
                ]
              }
            };

            const currentData = performanceData[analyticsTab];
            const hoveredPoint = hoveredIndex !== null ? currentData.points[hoveredIndex] : null;

            const endpointsPerformance = [
              { path: "/webservices/users/get-all-users", method: "POST", calls: 412, avgTime: "45ms", errorRate: "0.0%" },
              { path: "/webservices/users/add-users", method: "POST", calls: 48, avgTime: "128ms", errorRate: "0.0%" },
              { path: "/webservices/users/update-user", method: "POST", calls: 24, avgTime: "115ms", errorRate: "4.1%" },
              { path: "/webservices/users/delete-user", method: "POST", calls: 12, avgTime: "92ms", errorRate: "0.0%" },
              { path: "/login", method: "POST", calls: 154, avgTime: "74ms", errorRate: "1.3%" },
              { path: "/signup", method: "POST", calls: 32, avgTime: "88ms", errorRate: "0.0%" },
              { path: "/api/health", method: "GET", calls: 1440, avgTime: "4ms", errorRate: "0.0%" }
            ];

            return (
              <div className="analytics-dashboard">
                {/* KPI Grid */}
                <div className="analytics-kpi-grid">
                  <div className="analytics-kpi-card">
                    <div className="kpi-icon blue">⚡</div>
                    <div>
                      <div className="kpi-title">Average Latency</div>
                      <div className="kpi-value">58 ms</div>
                      <div className="kpi-trend positive">↓ 12% vs yesterday</div>
                    </div>
                  </div>
                  <div className="analytics-kpi-card">
                    <div className="kpi-icon green">📈</div>
                    <div>
                      <div className="kpi-title">Request Volume</div>
                      <div className="kpi-value">186 RPM</div>
                      <div className="kpi-trend positive">↑ 8% growth</div>
                    </div>
                  </div>
                  <div className="analytics-kpi-card">
                    <div className="kpi-icon red">⚠️</div>
                    <div>
                      <div className="kpi-title">HTTP Error Rate</div>
                      <div className="kpi-value">0.36%</div>
                      <div className="kpi-trend positive">Healthy</div>
                    </div>
                  </div>
                  <div className="analytics-kpi-card">
                    <div className="kpi-icon purple">💾</div>
                    <div>
                      <div className="kpi-title">Database Pool</div>
                      <div className="kpi-value">Active</div>
                      <div className="kpi-trend positive">100% connected</div>
                    </div>
                  </div>
                </div>

                {/* Main Interactive Chart Card */}
                <div className="card performance-chart-card">
                  <div className="chart-card-header">
                    <div className="chart-header-left">
                      <span className="chart-card-title">Performance Analytics</span>
                      <p className="chart-card-subtitle">Real-time system telemetry and load tracking</p>
                    </div>
                    <div className="analytics-tab-buttons">
                      <button
                        type="button"
                        className={`analytics-tab-btn ${analyticsTab === "latency" ? "active" : ""}`}
                        onClick={() => setAnalyticsTab("latency")}
                        style={{ borderColor: analyticsTab === "latency" ? "#6366f1" : "transparent" }}
                      >
                        API Latency
                      </button>
                      <button
                        type="button"
                        className={`analytics-tab-btn ${analyticsTab === "volume" ? "active" : ""}`}
                        onClick={() => setAnalyticsTab("volume")}
                        style={{ borderColor: analyticsTab === "volume" ? "#10b981" : "transparent" }}
                      >
                        Request Volume
                      </button>
                      <button
                        type="button"
                        className={`analytics-tab-btn ${analyticsTab === "errors" ? "active" : ""}`}
                        onClick={() => setAnalyticsTab("errors")}
                        style={{ borderColor: analyticsTab === "errors" ? "#ef4444" : "transparent" }}
                      >
                        Error Rates
                      </button>
                    </div>
                  </div>

                  <div className="performance-chart-body">
                    <div className="chart-summary-sidebar">
                      <div className="sidebar-metric">
                        <span className="sidebar-metric-label">CURRENT METRIC</span>
                        <span className="sidebar-metric-value" style={{ color: currentData.color }}>
                          {currentData.title}
                        </span>
                      </div>
                      <div className="sidebar-metric">
                        <span className="sidebar-metric-label">AVERAGE</span>
                        <span className="sidebar-metric-value">{currentData.avg}</span>
                      </div>
                      <div className="sidebar-metric">
                        <span className="sidebar-metric-label">PEAK (6H)</span>
                        <span className="sidebar-metric-value">{currentData.peak}</span>
                      </div>
                      <div className="sidebar-metric">
                        <span className="sidebar-metric-label">STATUS</span>
                        <span className="sidebar-metric-badge" style={{ backgroundColor: currentData.color + "20", color: currentData.color }}>
                          {currentData.status}
                        </span>
                      </div>
                    </div>

                    <div className="interactive-chart-container">
                      {hoveredIndex !== null && hoveredPoint && (
                        <div
                          className="chart-tooltip"
                          style={{
                            borderLeftColor: currentData.color,
                            left: `${50 + hoveredIndex * 86.6 + 8}px`,
                            top: `${180 - (hoveredPoint.value / currentData.maxVal) * 160 - 55}px`
                          }}
                        >
                          <div className="tooltip-time">{hoveredPoint.time}</div>
                          <div className="tooltip-value">
                            <span className="tooltip-dot" style={{ backgroundColor: currentData.color }}></span>
                            {hoveredPoint.value}{currentData.unit}
                          </div>
                        </div>
                      )}

                      <svg className="performance-chart-svg" viewBox="0 0 600 220">
                        {/* Horizontal Gridlines and Y-axis Labels */}
                        {currentData.gridValues.map((v, idx) => {
                          const y = 180 - (v / currentData.maxVal) * 160;
                          return (
                            <g key={idx}>
                              <line
                                x1="50"
                                y1={y}
                                x2="570"
                                y2={y}
                                stroke="var(--border)"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                              />
                              <text
                                x="42"
                                y={y + 4}
                                textAnchor="end"
                                fontSize="10.5"
                                fontWeight="500"
                                fill="var(--text-light)"
                              >
                                {v}{currentData.unit}
                              </text>
                            </g>
                          );
                        })}

                        {/* Baseline X-axis */}
                        <line x1="50" y1="180" x2="570" y2="180" stroke="var(--border)" strokeWidth="1.5" />

                        {/* Dynamic Bars */}
                        {currentData.points.map((pt, idx) => {
                          const colWidth = 86.6;
                          const barWidth = 36;
                          const barX = 50 + idx * colWidth + (colWidth - barWidth) / 2;
                          const barHeight = (pt.value / currentData.maxVal) * 160;
                          const barY = 180 - barHeight;
                          const isHovered = hoveredIndex === idx;

                          return (
                            <g key={idx}>
                              {/* Hover sensor zone (invisible wider rect for easier hovering) */}
                              <rect
                                x={50 + idx * colWidth}
                                y="20"
                                width={colWidth}
                                height="160"
                                fill="transparent"
                                style={{ cursor: "pointer" }}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                              />
                              {/* Actual Visual Bar */}
                              <rect
                                x={barX}
                                y={barY}
                                width={barWidth}
                                height={Math.max(barHeight, 2)}
                                fill={isHovered ? currentData.color : currentData.color + "cc"}
                                rx="5"
                                style={{
                                  transition: "all 0.2s ease",
                                  cursor: "pointer"
                                }}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                              />
                              {/* Bar Top Circle Accent on Hover */}
                              {isHovered && (
                                <circle
                                  cx={barX + barWidth / 2}
                                  cy={barY}
                                  r="4"
                                  fill="#ffffff"
                                  stroke={currentData.color}
                                  strokeWidth="2.5"
                                />
                              )}
                              {/* X-axis Label */}
                              <text
                                x={barX + barWidth / 2}
                                y="198"
                                textAnchor="middle"
                                fontSize="11"
                                fill="var(--text-light)"
                                fontWeight="500"
                              >
                                {pt.time}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Endpoint Performance Table */}
                <div className="card">
                  <div className="card-title">Endpoint Latency Breakdown</div>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>HTTP Method</th>
                          <th>API Endpoint Path</th>
                          <th>Request Count</th>
                          <th>Avg Response Time</th>
                          <th>Error Rate</th>
                          <th>Service Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {endpointsPerformance.map((ep, idx) => (
                          <tr key={idx}>
                            <td>
                              <span style={{
                                padding: "3px 8px",
                                borderRadius: "4px",
                                fontSize: "10px",
                                fontWeight: "bold",
                                backgroundColor: ep.method === "POST" ? "#eff6ff" : "#f0fdf4",
                                color: ep.method === "POST" ? "#2563eb" : "#16a34a",
                                border: `1px solid ${ep.method === "POST" ? "#bfdbfe" : "#bbf7d0"}`
                              }}>
                                {ep.method}
                              </span>
                            </td>
                            <td>
                              <code>{ep.path}</code>
                            </td>
                            <td>{ep.calls} requests</td>
                            <td>
                              <strong>{ep.avgTime}</strong>
                            </td>
                            <td>
                              <span style={{
                                color: ep.errorRate === "0.0%" ? "var(--success)" : "var(--danger)"
                              }}>
                                {ep.errorRate}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${parseFloat(ep.errorRate) < 2.0 ? "active" : "offline"}`}>
                                {parseFloat(ep.errorRate) < 2.0 ? "Operational" : "Degraded"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* USERS MANAGEMENT VIEW */}
          {activeMenu === "users" && (
            <div className="card">
              <div className="card-title">User Directory</div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name & Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Date Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((m) => (
                      <tr key={m.id}>
                        <td><strong>{m.name}</strong><br/><small>{m.email}</small></td>
                        <td>{m.role}</td>
                        <td><span className={`badge ${m.status === 1 ? "active" : "offline"}`}>{m.status === 1 ? "Active" : "Inactive"}</span></td>
                        <td>{m.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {activeMenu === "settings" && (
            <div className="content-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="card">
                <div className="card-title">Profile Information</div>
                <form onSubmit={handleSaveProfile} className="settings-section">
                  <div className="settings-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      className="settings-input"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="settings-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="settings-input"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="action-btn" style={{ width: "fit-content" }}>
                    Save Profile
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal: Add User */}
      <Modal
        isOpen={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        title="Add New Database User"
      >
        <form onSubmit={handleAddMemberSubmit} className="settings-section">
          <div className="settings-group">
            <label>Full Name</label>
            <input
              type="text"
              className="settings-input"
              placeholder="e.g. Sarah Jenkins"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              required
            />
          </div>

          <div className="settings-group">
            <label>Email Address</label>
            <input
              type="email"
              className="settings-input"
              placeholder="sarah@company.com"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              required
            />
          </div>

          <div className="settings-group">
            <label>Password</label>
            <input
              type="password"
              className="settings-input"
              value={newMemberPassword}
              onChange={(e) => setNewMemberPassword(e.target.value)}
              required
            />
          </div>

          <div className="settings-group">
            <label>User Role</label>
            <select
              className="filter-select"
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value)}
            >
              <option value="user">User (Standard)</option>
              <option value="admin">Admin (Full Control)</option>
            </select>
          </div>

          <button type="submit" className="action-btn">
            Create User Account
          </button>
        </form>
      </Modal>

      {/* Modal: Edit User (Admin) */}
      <Modal
        isOpen={editUserModalOpen}
        onClose={() => { setEditUserModalOpen(false); setEditingUser(null); }}
        title="Edit User Account"
      >
        {editingUser && (
          <form onSubmit={handleEditUserSubmit} className="settings-section">
            <div className="settings-group">
              <label>Full Name</label>
              <input
                type="text"
                className="settings-input"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                required
              />
            </div>

            <div className="settings-group">
              <label>Email Address</label>
              <input
                type="email"
                className="settings-input"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                required
              />
            </div>

            <div className="settings-group">
              <label>Role</label>
              <select
                className="filter-select"
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
              >
                <option value="user">User (Standard)</option>
                <option value="admin">Admin (Full Control)</option>
              </select>
            </div>

            <div className="settings-group">
              <label>Status</label>
              <select
                className="filter-select"
                value={editingUser.status}
                onChange={(e) => setEditingUser({ ...editingUser, status: Number(e.target.value) })}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive / Suspended</option>
              </select>
            </div>

            <button type="submit" className="action-btn">
              Save User Changes
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default Dashboard;
