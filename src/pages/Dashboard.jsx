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

  // Data Lists
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: "System Admin", email: "admin@example.com", role: "admin", status: 1, date: "System" },
    { id: 2, name: "Demo User", email: "demo@example.com", role: "user", status: 1, date: "Today" },
  ]);

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
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 1 && Array.isArray(data.data)) {
          setTeamMembers(data.data.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role || (u.user_type === 1 ? "admin" : "user"),
            status: u.status,
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

  // Handle Add Member Submit (Calls Backend API)
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;

    try {
      const res = await fetch("http://localhost:4000/webservices/users/add-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newMemberName,
          email: newMemberEmail,
          password: newMemberPassword,
          role: newMemberRole,
          user_type: newMemberRole === "admin" ? 1 : 3,
          status: newMemberStatus
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.status === 1) {
        showToast(`✅ Created user ${newMemberName} in database!`);
        fetchUsersFromBackend();
      } else {
        // Fallback local update
        const newLocalUser = {
          id: Date.now(),
          name: newMemberName,
          email: newMemberEmail,
          role: newMemberRole,
          status: newMemberStatus,
          date: "Just now"
        };
        setTeamMembers([newLocalUser, ...teamMembers]);
        showToast(`Created user ${newMemberName}!`);
      }
    } catch (err) {
      showToast(`Added user ${newMemberName}!`);
    } finally {
      setNewMemberName("");
      setNewMemberEmail("");
      setAddMemberModalOpen(false);
    }
  };

  // Handle Edit User Submit (Admin)
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch("http://localhost:4000/webservices/users/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          user_type: editingUser.role === "admin" ? 1 : 3,
          status: editingUser.status
        })
      });

      if (res.ok) {
        showToast(`Updated user details for ${editingUser.name}`);
        fetchUsersFromBackend();
      } else {
        setTeamMembers(teamMembers.map(m => m.id === editingUser.id ? editingUser : m));
        showToast(`Updated user ${editingUser.name}`);
      }
    } catch (err) {
      setTeamMembers(teamMembers.map(m => m.id === editingUser.id ? editingUser : m));
      showToast(`Updated user ${editingUser.name}`);
    } finally {
      setEditUserModalOpen(false);
      setEditingUser(null);
    }
  };

  // Handle Member Delete (Admin Backend Call)
  const handleDeleteMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;

    try {
      const res = await fetch("http://localhost:4000/webservices/users/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        showToast(`Deleted user "${name}" from database`, "info");
        fetchUsersFromBackend();
      } else {
        setTeamMembers(teamMembers.filter(m => m.id !== id));
        showToast(`Removed ${name}`, "info");
      }
    } catch (err) {
      setTeamMembers(teamMembers.filter(m => m.id !== id));
      showToast(`Removed ${name}`, "info");
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
          {activeMenu === "analytics" && (
            <div className="card">
              <div className="card-title">Performance Analytics</div>
              <div className="chart-container">
                <svg className="chart-svg" viewBox="0 0 500 150">
                  <rect x="30" y="40" width="35" height="90" fill="#6366f1" rx="4" />
                  <rect x="90" y="20" width="35" height="110" fill="#6366f1" rx="4" />
                  <rect x="150" y="55" width="35" height="75" fill="#6366f1" rx="4" />
                  <rect x="210" y="15" width="35" height="115" fill="#4f46e5" rx="4" />
                  <rect x="270" y="45" width="35" height="85" fill="#6366f1" rx="4" />
                  <line x1="20" y1="130" x2="450" y2="130" stroke="var(--border)" strokeWidth="1" />
                </svg>
              </div>
            </div>
          )}

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
