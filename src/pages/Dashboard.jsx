import { useState, useEffect } from "react";
import { Modal, Toast } from "../components/Modal";
import "../styles/Dashboard.css";

function Dashboard({ user, onLogout, onUpdateUser }) {
  const [roles, setRoles] = useState([
    {
      id: "admin",
      name: "Admin",
      description: "Full system access and authority to manage all users and roles.",
      permissions: ["dashboard.view", "users.view", "users.create", "users.edit", "users.delete", "roles.manage", "reports.view", "files.upload"],
      is_system: true,
      color: "#6366f1"
    },
    {
      id: "editor",
      name: "Editor",
      description: "Can view dashboard, edit user details, upload files, and manage content.",
      permissions: ["dashboard.view", "users.view", "users.edit", "reports.view", "files.upload"],
      is_system: true,
      color: "#06b6d4"
    },
    {
      id: "viewer",
      name: "Viewer",
      description: "Read-only access to dashboard and user directory.",
      permissions: ["dashboard.view", "users.view"],
      is_system: true,
      color: "#64748b"
    }
  ]);

  const [availablePermissions, setAvailablePermissions] = useState([
    { key: 'dashboard.view', name: 'View Dashboard Overview', category: 'General Access' },
    { key: 'users.view', name: 'View User Directory', category: 'User Management' },
    { key: 'users.create', name: 'Create New Users', category: 'User Management' },
    { key: 'users.edit', name: 'Edit User Details', category: 'User Management' },
    { key: 'users.delete', name: 'Delete User Accounts', category: 'User Management' },
    { key: 'roles.manage', name: 'Manage Roles & Permissions', category: 'System Administration' },
    { key: 'reports.view', name: 'View Analytics & Reports', category: 'Reports & Files' },
    { key: 'files.upload', name: 'Upload & Manage Files', category: 'Reports & Files' },
  ]);

  const isAdmin = user?.role === "admin" || user?.user_type === 1 || user?.email?.includes("admin");
  const isEditor = user?.role === "editor" || user?.user_type === 2;
  const isViewer = !isAdmin && !isEditor;

  // Resolve user role & permissions
  const userRoleObj = roles.find(r => r.id === user?.role || r.name.toLowerCase() === (user?.role || '').toLowerCase()) ||
    (isAdmin ? roles[0] : isEditor ? roles[1] : roles[2]);

  const userPermissions = userRoleObj?.permissions ||
    (isAdmin ? availablePermissions.map(p => p.key) : isEditor ? ['dashboard.view', 'users.view', 'users.edit', 'files.upload'] : ['dashboard.view', 'users.view']);

  const hasPermission = (permKey) => isAdmin || userPermissions.includes(permKey);

  const canAdd = hasPermission('users.create');
  const canEdit = hasPermission('users.edit');
  const canDelete = hasPermission('users.delete');
  const canManageRoles = hasPermission('roles.manage');

  // Navigation & UI State
  const [activeMenu, setActiveMenu] = useState(isAdmin || isEditor || canManageRoles ? "admin" : "overview");
  const [adminSubTab, setAdminSubTab] = useState("users"); // 'users' | 'roles'
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
  const [newMemberRole, setNewMemberRole] = useState("viewer");
  const [newMemberStatus, setNewMemberStatus] = useState(1);

  // Edit User Modal State
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Role Management Modal State
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [roleColor, setRoleColor] = useState("#8b5cf6");

  const [userStatusFilter, setUserStatusFilter] = useState("All");

  // Settings Form State
  const [profileName, setProfileName] = useState(user?.name || "User");
  const [profileEmail, setProfileEmail] = useState(user?.email || "user@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Add Profile in Settings State
  const [addProfName, setAddProfName] = useState("");
  const [addProfEmail, setAddProfEmail] = useState("");
  const [addProfPassword, setAddProfPassword] = useState("");
  const [addProfRole, setAddProfRole] = useState("viewer");
  const [addProfTitle, setAddProfTitle] = useState("");
  const [addProfAvatarColor, setAddProfAvatarColor] = useState("#4f46e5");

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
      { id: 2, name: "Editor User", email: "editor@example.com", role: "editor", status: 1, date: "Today" },
      { id: 3, name: "Viewer User", email: "viewer@example.com", role: "viewer", status: 1, date: "Today" },
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

  // Fetch roles from backend API
  const fetchRolesFromBackend = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/roles");
      if (res.ok) {
        const data = await res.json();
        if (data.status === 1 && Array.isArray(data.roles)) {
          setRoles(data.roles);
        }
        if (Array.isArray(data.available_permissions) && data.available_permissions.length > 0) {
          setAvailablePermissions(data.available_permissions);
        }
      }
    } catch (e) {
      console.warn("Backend offline, using fallback roles:", e);
    }
  };

  useEffect(() => {
    fetchUsersFromBackend();
    fetchRolesFromBackend();
  }, [activeMenu]);

  // Role Management Handlers
  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions(["dashboard.view", "users.view"]);
    setRoleColor("#8b5cf6");
    setRoleModalOpen(true);
  };

  const handleOpenEditRole = (role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || "");
    setSelectedPermissions(role.permissions || []);
    setRoleColor(role.color || "#8b5cf6");
    setRoleModalOpen(true);
  };

  const handleTogglePermission = (permKey) => {
    setSelectedPermissions(prev =>
      prev.includes(permKey) ? prev.filter(k => k !== permKey) : [...prev, permKey]
    );
  };

  const handleSelectAllPermissions = () => {
    setSelectedPermissions(availablePermissions.map(p => p.key));
  };

  const handleClearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    if (editingRole) {
      // Edit existing role
      const updated = {
        ...editingRole,
        name: roleName.trim(),
        description: roleDescription,
        permissions: selectedPermissions,
        color: roleColor
      };
      setRoles(prev => prev.map(r => r.id === editingRole.id ? updated : r));
      showToast(`Updated permissions for role "${roleName}"!`);
      setRoleModalOpen(false);

      try {
        await fetch(`http://localhost:4000/api/roles/${editingRole.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: roleName,
            description: roleDescription,
            permissions: selectedPermissions,
            color: roleColor
          })
        });
      } catch (err) {}
    } else {
      // Create new role
      const slug = roleName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
      const newRole = {
        id: slug,
        name: roleName.trim(),
        description: roleDescription,
        permissions: selectedPermissions,
        is_system: false,
        color: roleColor
      };

      setRoles(prev => [...prev, newRole]);
      showToast(`✅ Created custom role "${roleName}" on the spot!`);
      setRoleModalOpen(false);

      try {
        const res = await fetch("http://localhost:4000/api/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRole)
        });
        if (res.ok) fetchRolesFromBackend();
      } catch (err) {}
    }
  };

  const handleDeleteRole = async (roleId, rName) => {
    if (!window.confirm(`Are you sure you want to delete custom role "${rName}"?`)) return;

    setRoles(prev => prev.filter(r => r.id !== roleId));
    showToast(`Deleted role "${rName}"`, "info");

    try {
      await fetch(`http://localhost:4000/api/roles/${roleId}`, { method: "DELETE" });
    } catch (err) {}
  };

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

  // Handle Add Profile in Settings
  const handleAddProfileInSettings = async (e) => {
    e.preventDefault();
    if (!addProfName || !addProfEmail) return;

    const tempId = Date.now();
    const newProfileUser = {
      id: tempId,
      name: addProfName.trim(),
      email: addProfEmail.trim(),
      role: addProfRole,
      status: 1,
      date: "Just now",
      title: addProfTitle || (addProfRole === "admin" ? "System Admin" : addProfRole === "editor" ? "Content Editor" : "Viewer"),
      avatarColor: addProfAvatarColor
    };

    // Update local state immediately
    setTeamMembers((prev) => [newProfileUser, ...prev]);
    showToast(`✅ Profile "${addProfName}" created successfully!`);

    // Reset form fields
    setAddProfName("");
    setAddProfEmail("");
    setAddProfPassword("");
    setAddProfRole("viewer");
    setAddProfTitle("");

    // Sync to Backend DB
    try {
      const res = await fetch("http://localhost:4000/webservices/users/add-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProfileUser.name,
          email: newProfileUser.email,
          password: addProfPassword || "password123",
          role: newProfileUser.role,
          user_type: newProfileUser.role === "admin" ? 1 : newProfileUser.role === "editor" ? 2 : 3,
          status: 1
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
      console.warn("Backend offline, profile saved locally:", err);
    }
  };

  // Quick Switch Profile Handler
  const handleSwitchProfile = (member) => {
    if (onUpdateUser) {
      onUpdateUser({ ...member });
    }
    setProfileName(member.name);
    setProfileEmail(member.email);
    localStorage.setItem("user_session", JSON.stringify(member));
    showToast(`Switched active profile to ${member.name}!`, "info");
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
            {isAdmin && <div style={{ fontSize: "10px", fontWeight: "bold", color: "#ef4444", letterSpacing: "1px" }}>ADMIN CONTROL</div>}
            {isEditor && <div style={{ fontSize: "10px", fontWeight: "bold", color: "#f59e0b", letterSpacing: "1px" }}>EDITOR ACCESS</div>}
            {isViewer && <div style={{ fontSize: "10px", fontWeight: "bold", color: "var(--primary)", letterSpacing: "1px" }}>VIEWER MODE</div>}
          </div>
        </div>

        <nav className="sidebar-menu">
          {(isAdmin || isEditor) && (
            <button
              type="button"
              className={`menu-item ${activeMenu === "admin" ? "active" : ""}`}
              onClick={() => setActiveMenu("admin")}
              style={{ background: activeMenu === "admin" ? "var(--primary-light)" : "transparent", fontWeight: "bold" }}
            >
              <span>🔑</span> Directory Control Center
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

            <div className="avatar" style={{ background: isAdmin ? "#ef4444" : isEditor ? "#f59e0b" : "var(--primary)" }}>{initials}</div>
            <div className="user-info">
              <span className="user-name">
                {profileName} {isAdmin ? <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: "bold" }}>(ADMIN)</span> : isEditor ? <span style={{ fontSize: "11px", color: "#f59e0b", fontWeight: "bold" }}>(EDITOR)</span> : <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "bold" }}>(VIEWER)</span>}
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
                {activeMenu === "admin" && "🔑 Control Center & Directory"}
                {activeMenu === "overview" && "Dashboard Overview"}
                {activeMenu === "analytics" && "Analytics & Performance"}
                {activeMenu === "users" && "User & Team Management"}
                {activeMenu === "settings" && "Account & System Settings"}
              </h1>
              <p className="view-subtitle">
                Welcome back, {profileName}! {isAdmin ? "⚡ Full Admin Control (Add, Edit & Delete active)." : isEditor ? "✏️ Editor Access (Add & Edit active, No Delete)." : "👁️ Viewer Access (Read-Only mode)." }
              </p>
            </div>

            <div className="header-actions">
              {(activeMenu === "admin" || activeMenu === "users") && (
                <>
                  <button type="button" className="secondary-btn" onClick={exportCSV}>
                    📥 Export CSV
                  </button>
                  {canAdd && (
                    <button type="button" className="action-btn" onClick={() => setAddMemberModalOpen(true)}>
                      <span>+</span> Add New User
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ADMIN CONTROL CENTER & ROLES MANAGEMENT VIEW */}
          {activeMenu === "admin" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Sub-tab Switcher Bar */}
              <div className="admin-subtabs" style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
                <button
                  type="button"
                  className={`subtab-btn ${adminSubTab === "users" ? "active" : ""}`}
                  onClick={() => setAdminSubTab("users")}
                >
                  👥 User Directory & Accounts ({teamMembers.length})
                </button>
                <button
                  type="button"
                  className={`subtab-btn ${adminSubTab === "roles" ? "active" : ""}`}
                  onClick={() => setAdminSubTab("roles")}
                >
                  🛡️ Custom Roles & Granular Permissions ({roles.length})
                </button>
              </div>

              {/* STATS OVERVIEW */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Database Users</span>
                    <div className="stat-icon blue">👥</div>
                  </div>
                  <div className="stat-value">{teamMembers.length}</div>
                  <span className="stat-badge positive">Registered Accounts</span>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Configured Roles</span>
                    <div className="stat-icon purple">🛡️</div>
                  </div>
                  <div className="stat-value">{roles.length}</div>
                  <span className="stat-badge positive">{roles.filter(r => !r.is_system).length} Custom Created</span>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">System Permissions</span>
                    <div className="stat-icon green">⚡</div>
                  </div>
                  <div className="stat-value">{availablePermissions.length}</div>
                  <span className="stat-badge positive">Granular Controls</span>
                </div>
              </div>

              {/* TAB 1: USERS DIRECTORY TABLE */}
              {adminSubTab === "users" && (
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
                          <th>Role Access</th>
                          <th>Status</th>
                          <th>Date Added</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMembers.map((m) => {
                          const matchedRole = roles.find(r => r.id === m.role || r.name.toLowerCase() === (m.role || '').toLowerCase());
                          return (
                            <tr key={m.id}>
                              <td><strong>#{m.id}</strong></td>
                              <td>
                                <strong>{m.name}</strong>
                                <br />
                                <small style={{ color: "var(--text-light)" }}>{m.email}</small>
                              </td>
                              <td>
                                <span style={{
                                  padding: "3px 10px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  background: matchedRole?.color ? `${matchedRole.color}22` : "var(--primary-light)",
                                  color: matchedRole?.color || "var(--primary)",
                                  border: `1px solid ${matchedRole?.color || "var(--primary)"}44`
                                }}>
                                  🛡️ {matchedRole?.name || (m.role ? m.role.toUpperCase() : "VIEWER")}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${m.status === 1 ? "active" : "offline"}`}>
                                  {m.status === 1 ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td>{m.date}</td>
                              <td>
                                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                  {canEdit && (
                                    <button
                                      type="button"
                                      className="action-icon-btn"
                                      onClick={() => { setEditingUser({ ...m }); setEditUserModalOpen(true); }}
                                      style={{ color: "var(--primary)" }}
                                    >
                                      ✏️ Edit
                                    </button>
                                  )}
                                  {canDelete && (
                                    <button
                                      type="button"
                                      className="action-icon-btn"
                                      onClick={() => handleDeleteMember(m.id, m.name)}
                                      style={{ color: "#ef4444" }}
                                    >
                                      🗑️ Delete
                                    </button>
                                  )}
                                  {!canEdit && !canDelete && (
                                    <span style={{ fontSize: "12px", color: "var(--text-light)", fontStyle: "italic" }}>
                                      👁️ Read-Only
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: ROLES & PERMISSIONS MANAGEMENT */}
              {adminSubTab === "roles" && (
                <div className="card">
                  <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <span>🛡️ Roles & Granular Permissions Directory</span>
                      <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted)", fontWeight: "normal" }}>
                        Admins can create custom roles on the spot and select specific checkbox permissions granted to users of that role.
                      </p>
                    </div>

                    {canManageRoles && (
                      <button type="button" className="action-btn" onClick={handleOpenCreateRole}>
                        <span>➕</span> Create New Custom Role
                      </button>
                    )}
                  </div>

                  <div className="roles-grid">
                    {roles.map((r) => {
                      const userCount = teamMembers.filter(m => m.role === r.id || m.role?.toLowerCase() === r.name.toLowerCase()).length;
                      const permCount = r.permissions?.length || 0;

                      return (
                        <div key={r.id} className="role-card" style={{ borderTop: `4px solid ${r.color || "var(--primary)"}` }}>
                          <div>
                            <div className="role-card-header">
                              <div>
                                <h3 className="role-title">
                                  <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: r.color || "var(--primary)", display: "inline-block" }}></span>
                                  {r.name}
                                </h3>
                                <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}>
                                  {r.is_system ? (
                                    <span className="badge active" style={{ fontSize: "10px" }}>System Default</span>
                                  ) : (
                                    <span className="badge" style={{ fontSize: "10px", background: "#f3e8ff", color: "#9333ea" }}>Custom Created</span>
                                  )}
                                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                    &bull; {userCount} {userCount === 1 ? 'user' : 'users'} assigned
                                  </span>
                                </div>
                              </div>
                            </div>

                            <p className="role-desc">{r.description || "No description provided."}</p>

                            <div style={{ marginTop: "14px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-main)" }}>
                                  Permissions Granted ({permCount} / {availablePermissions.length})
                                </span>
                              </div>

                              <div className="permission-tags-container">
                                {r.permissions && r.permissions.length > 0 ? (
                                  r.permissions.map(permKey => {
                                    const permObj = availablePermissions.find(p => p.key === permKey);
                                    return (
                                      <span key={permKey} className="permission-chip" style={{ background: `${r.color || '#4f46e5'}15`, color: r.color || '#4f46e5' }}>
                                        ✓ {permObj ? permObj.name : permKey}
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span style={{ fontSize: "12px", color: "var(--danger)", fontStyle: "italic" }}>
                                    No permissions assigned
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "10px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                            {canManageRoles && (
                              <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => handleOpenEditRole(r)}
                                style={{ flex: 1, justifyContent: "center", fontSize: "12px" }}
                              >
                                ✏️ Edit Permissions
                              </button>
                            )}
                            {canManageRoles && !r.is_system && (
                              <button
                                type="button"
                                className="action-icon-btn"
                                onClick={() => handleDeleteRole(r.id, r.name)}
                                style={{ color: "var(--danger)", padding: "6px 10px" }}
                                title="Delete Role"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
            <div className="settings-container-layout">
              {/* Active Profile Header Banner */}
              <div className="settings-header-banner">
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    className="avatar-large"
                    style={{
                      background: isAdmin ? "#ef4444" : isEditor ? "#f59e0b" : "var(--primary)",
                      width: "54px",
                      height: "54px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "20px",
                      fontWeight: "bold",
                      boxShadow: "var(--shadow-md)"
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "var(--text-main)" }}>
                      {profileName}
                    </h2>
                    <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "14px" }}>
                      {profileEmail} &bull; <span style={{ textTransform: "capitalize", fontWeight: "600", color: "var(--primary)" }}>{user?.role || "User"} Account</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="content-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "20px" }}>
                {/* CARD 1: EDIT ACTIVE PROFILE */}
                <div className="card">
                  <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>👤 Edit Active Profile</span>
                  </div>
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
                    <div className="settings-group">
                      <label>New Password (Optional)</label>
                      <input
                        type="password"
                        className="settings-input"
                        placeholder="Leave blank to keep current password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="action-btn" style={{ width: "fit-content" }}>
                      Save Active Profile
                    </button>
                  </form>
                </div>

                {/* CARD 2: ADD NEW PROFILE */}
                <div className="card" style={{ borderTop: "4px solid var(--primary)" }}>
                  <div className="card-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>➕ Add New Profile</span>
                    <span className="badge active" style={{ fontSize: "11px" }}>Settings Control</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                    Create a new user profile account for your team or workspace right from Settings.
                  </p>
                  <form onSubmit={handleAddProfileInSettings} className="settings-section">
                    <div className="settings-group">
                      <label>Profile Full Name *</label>
                      <input
                        type="text"
                        className="settings-input"
                        placeholder="e.g. Sarah Connor"
                        value={addProfName}
                        onChange={(e) => setAddProfName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="settings-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        className="settings-input"
                        placeholder="sarah@company.com"
                        value={addProfEmail}
                        onChange={(e) => setAddProfEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="settings-group">
                      <label>Account Password</label>
                      <input
                        type="password"
                        className="settings-input"
                        placeholder="Password (default: password123)"
                        value={addProfPassword}
                        onChange={(e) => setAddProfPassword(e.target.value)}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div className="settings-group">
                        <label>Role Access</label>
                        <select
                          className="filter-select"
                          value={addProfRole}
                          onChange={(e) => setAddProfRole(e.target.value)}
                          style={{ width: "100%" }}
                        >
                          <option value="viewer">👁️ Viewer</option>
                          <option value="editor">✏️ Editor</option>
                          <option value="admin">⚡ Admin</option>
                        </select>
                      </div>

                      <div className="settings-group">
                        <label>Avatar Color</label>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "6px" }}>
                          {["#4f46e5", "#059669", "#dc2626", "#d97706", "#7c3aed"].map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setAddProfAvatarColor(color)}
                              style={{
                                width: "26px",
                                height: "26px",
                                borderRadius: "50%",
                                backgroundColor: color,
                                border: addProfAvatarColor === color ? "2px solid var(--text-main)" : "none",
                                cursor: "pointer",
                                transform: addProfAvatarColor === color ? "scale(1.15)" : "scale(1)",
                                transition: "all 0.15s ease"
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="action-btn" style={{ marginTop: "12px", width: "100%" }}>
                      <span>➕</span> Create Profile Account
                    </button>
                  </form>
                </div>
              </div>

              {/* CARD 3: SAVED PROFILES & SWITCHER */}
              <div className="card" style={{ marginTop: "24px" }}>
                <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <span>🔀 Workspace Profiles ({teamMembers.length} Available)</span>
                  <small style={{ color: "var(--text-muted)" }}>Click "Switch Profile" to instantly change active profile</small>
                </div>
                <div className="profiles-switcher-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginTop: "16px" }}>
                  {teamMembers.map((m) => {
                    const isCurrent = m.email.toLowerCase() === profileEmail.toLowerCase();
                    const mInitials = m.name.split(" ").map(n => n[0]).join("").toUpperCase() || "U";
                    const mColor = m.avatarColor || (m.role === "admin" ? "#ef4444" : m.role === "editor" ? "#f59e0b" : "#4f46e5");

                    return (
                      <div
                        key={m.id}
                        className={`profile-card-item ${isCurrent ? "current-active" : ""}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "14px 16px",
                          borderRadius: "var(--radius-md)",
                          border: isCurrent ? "2px solid var(--primary)" : "1px solid var(--border)",
                          background: isCurrent ? "var(--primary-light)" : "var(--bg-input)",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            className="avatar"
                            style={{
                              background: mColor,
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontSize: "14px",
                              fontWeight: "bold"
                            }}
                          >
                            {mInitials}
                          </div>
                          <div>
                            <div style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
                              {m.name}
                              {isCurrent && (
                                <span className="badge active" style={{ fontSize: "10px", padding: "2px 6px" }}>
                                  Active
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                              {m.email} &bull; <strong style={{ textTransform: "capitalize" }}>{m.role}</strong>
                            </div>
                          </div>
                        </div>

                        {!isCurrent ? (
                          <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => handleSwitchProfile(m)}
                            style={{ fontSize: "12px", padding: "6px 12px" }}
                          >
                            Switch
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "bold" }}>
                            ✓ Current
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ margin: 0, fontWeight: "700" }}>User Role Access</label>
              {canManageRoles && (
                <button
                  type="button"
                  onClick={handleOpenCreateRole}
                  style={{
                    background: "var(--primary-light)",
                    color: "var(--primary)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  ✨ Build Custom Role & Permissions
                </button>
              )}
            </div>

            <select
              className="filter-select"
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value)}
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>
                  🛡️ {r.name} ({r.permissions?.length || 0} Permissions) {r.is_system ? '• System' : '• Custom'}
                </option>
              ))}
            </select>

            {/* Live Role Permission Preview Box */}
            {(() => {
              const selectedRoleObj = roles.find(r => r.id === newMemberRole || r.name.toLowerCase() === newMemberRole.toLowerCase());
              return selectedRoleObj ? (
                <div className="permissions-preview-box">
                  <div className="permissions-preview-title">
                    Permissions Included in "{selectedRoleObj.name}":
                  </div>
                  <div className="permission-tags-container">
                    {selectedRoleObj.permissions?.map(pKey => {
                      const pObj = availablePermissions.find(ap => ap.key === pKey);
                      return (
                        <span key={pKey} className="permission-chip" style={{ fontSize: "10px", padding: "2px 6px" }}>
                          ✓ {pObj ? pObj.name : pKey}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ) : null;
            })()}
          </div>

          <button type="submit" className="action-btn">
            Create User Account
          </button>
        </form>
      </Modal>

      {/* Modal: Edit User */}
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ margin: 0, fontWeight: "700" }}>Role Access</label>
                {canManageRoles && (
                  <button
                    type="button"
                    onClick={handleOpenCreateRole}
                    style={{
                      background: "var(--primary-light)",
                      color: "var(--primary)",
                      border: "1px solid rgba(99, 102, 241, 0.3)",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    ✨ Build Custom Role & Permissions
                  </button>
                )}
              </div>

              <select
                className="filter-select"
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>
                    🛡️ {r.name} ({r.permissions?.length || 0} Permissions) {r.is_system ? '• System' : '• Custom'}
                  </option>
                ))}
              </select>

              {/* Live Role Permission Preview Box */}
              {(() => {
                const selectedRoleObj = roles.find(r => r.id === editingUser.role || r.name.toLowerCase() === (editingUser.role || '').toLowerCase());
                return selectedRoleObj ? (
                  <div className="permissions-preview-box">
                    <div className="permissions-preview-title">
                      Permissions Granted to "{selectedRoleObj.name}":
                    </div>
                    <div className="permission-tags-container">
                      {selectedRoleObj.permissions?.map(pKey => {
                        const pObj = availablePermissions.find(ap => ap.key === pKey);
                        return (
                          <span key={pKey} className="permission-chip" style={{ fontSize: "10px", padding: "2px 6px" }}>
                            ✓ {pObj ? pObj.name : pKey}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : null;
              })()}
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

      {/* Modal: Create & Edit Custom Role on the Spot */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={editingRole ? `Edit Role: ${editingRole.name}` : "Create Custom Role on the Spot"}
      >
        <form onSubmit={handleSaveRole} className="settings-section">
          <div className="settings-group">
            <label>Role Name *</label>
            <input
              type="text"
              className="settings-input"
              placeholder="e.g. Content Moderator, Support Lead, Billing Admin"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              disabled={editingRole?.is_system}
              required
            />
          </div>

          <div className="settings-group">
            <label>Role Description</label>
            <input
              type="text"
              className="settings-input"
              placeholder="Brief summary of what users with this role can do"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
            />
          </div>

          <div className="settings-group">
            <label>Role Badge Color</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "6px" }}>
              {["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#6366f1"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setRoleColor(c)}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: c,
                    border: roleColor === c ? "2px solid var(--text-main)" : "none",
                    cursor: "pointer",
                    transform: roleColor === c ? "scale(1.15)" : "scale(1)",
                    transition: "all 0.15s ease"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Granular Permission Checkboxes Section */}
          <div className="settings-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ margin: 0, fontWeight: "700" }}>
                Select Role Permissions ({selectedPermissions.length} / {availablePermissions.length} Enabled)
              </label>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleSelectAllPermissions}
                  style={{ fontSize: "11px", padding: "4px 8px" }}
                >
                  Select All
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleClearAllPermissions}
                  style={{ fontSize: "11px", padding: "4px 8px" }}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Categorized Checkbox List */}
            {(() => {
              const categories = Array.from(new Set(availablePermissions.map(p => p.category)));
              return categories.map(cat => {
                const permsInCat = availablePermissions.filter(p => p.category === cat);
                return (
                  <div key={cat} className="permissions-category-box">
                    <div className="permissions-category-title">
                      <span>📌 {cat}</span>
                    </div>

                    <div className="permissions-grid">
                      {permsInCat.map(p => {
                        const isChecked = selectedPermissions.includes(p.key);
                        return (
                          <label key={p.key} className="permission-checkbox-item" style={{
                            borderColor: isChecked ? "var(--primary)" : "var(--border)",
                            background: isChecked ? "var(--primary-light)" : "var(--bg-card)"
                          }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(p.key)}
                            />
                            <div>
                              <div className="permission-name">{p.name}</div>
                              <div className="permission-key-tag">{p.key}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          <button type="submit" className="action-btn" style={{ marginTop: "12px" }}>
            {editingRole ? "💾 Save Permission Changes" : "✨ Create Custom Role On The Spot"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default Dashboard;
