import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/adminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    role: "user",
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState({ roles: [], registrations: [] });
  const [showAllLogs, setShowAllLogs] = useState(false);

  const [userWeeklyProgress, setUserWeeklyProgress] = useState([]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const loadUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allUsers = res.data;
      setUsers(allUsers);

      // Analytics
      const rolesCount = allUsers.reduce(
        (acc, u) => {
          if (u.role === "admin") acc.admin++;
          else acc.user++;
          return acc;
        },
        { admin: 0, user: 0 },
      );
      const registrations = allUsers.map((u) => ({ name: u.name, value: 1 }));
      setAnalytics({
        roles: [
          { name: "Admin", value: rolesCount.admin },
          { name: "User", value: rolesCount.user },
        ],
        registrations,
      });

      const progressRes = await Promise.all(
        allUsers.map(async (u) => {
          try {
            const entriesRes = await axios.get(
              `http://localhost:5000/api/admin/users/entries/${u._id}`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            const entries = entriesRes.data || [];

            // Unique tasks
            const tasks = [...new Set(entries.map((e) => e.task))];

            // Start of week
            const today = new Date();
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            weekStart.setHours(0, 0, 0, 0);

            const getTaskProgress = (task) => {
              let completedDays = 0;
              for (let i = 0; i < 7; i++) {
                const day = new Date(weekStart);
                day.setDate(weekStart.getDate() + i);

                const entry = entries.find(
                  (e) =>
                    e.task === task &&
                    new Date(e.date).toDateString() === day.toDateString() &&
                    e.completed,
                );

                if (entry) completedDays++;
              }
              return Math.round((completedDays / 7) * 100);
            };

            const completionPercent =
              tasks.length === 0
                ? 0
                : Math.round(
                    tasks.reduce((acc, t) => acc + getTaskProgress(t), 0) /
                      tasks.length,
                  );

            return { user: u, completionPercent };
          } catch {
            return { user: u, completionPercent: 0 };
          }
        }),
      );
      setUserWeeklyProgress(progressRes);
    } catch {
      toast.error("Session expired");
      handleLogout();
    }
  };

  const loadLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data || []);
    } catch {
      setLogs([]);
    }
  };

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);

  useEffect(() => {
    Promise.all([loadUsers(), loadLogs()]).finally(() => setLoading(false));
  }, []);

  /* ================= CRUD ================= */
  const updateUser = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${selectedUser._id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("User updated");
      setSelectedUser(null);
      loadUsers();
      loadLogs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted");
      loadUsers();
      loadLogs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  /* ================= FILTERED USERS ================= */
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalRegularUsers = totalUsers - totalAdmins;
  const COLORS = ["#facc15", "#38bdf8"];

  /* ================= RENDER ================= */
  return (
    <div className="admin-dashboard">
      <ToastContainer theme={darkMode ? "dark" : "light"} />

      {/* HEADER */}
      <div className="admin-header">
        <h2>Admin Dashboard</h2>

        <div className="header-actions">
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "🌙 Dark" : "☀️ Light"}
          </button>

          <button onClick={() => setShowAnalytics(!showAnalytics)}>
            📊 Analytics
          </button>

          <div className="profile-wrapper">
            <button onClick={() => setShowProfile(!showProfile)}>
              👤 {loggedInUser?.name}
            </button>

            {showProfile && (
              <div className="profile-dropdown">
                <p>{loggedInUser?.email}</p>
                <span className="role-badge admin">ADMIN</span>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ANALYTICS CARDS */}
      <div className="analytics-cards">
        <div className="card">
          <h4>Total Users</h4>
          <p>{totalUsers}</p>
        </div>
        <div className="card">
          <h4>Admins</h4>
          <p>{totalAdmins}</p>
        </div>
        <div className="card">
          <h4>Regular Users</h4>
          <p>{totalRegularUsers}</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="admin-filters">
        <input
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="user">Users</option>
        </select>
      </div>

      {/* MAIN CONTENT */}
      <div className="admin-main">
        {/* USER TABLE */}
        <div className="admin-left">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Permissions</th>
                  <th>Weekly Progress</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const progress =
                    userWeeklyProgress.find((up) => up.user?._id === u._id)
                      ?.completionPercent ?? 0;
                  return (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td>{u.role === "admin" ? "ALL" : "READ / WRITE"}</td>
                      <td>{progress}%</td>
                      <td>
                        <button
                          disabled={loggedInUser._id === u._id}
                          onClick={() => {
                            setSelectedUser(u);
                            setEditData(u);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          disabled={
                            loggedInUser._id === u._id || u.role === "admin"
                          }
                          onClick={() => deleteUser(u._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ANALYTICS SIDEBAR */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              className="analytics-sidebar"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
            >
              <h3>Analytics</h3>
              <div className="analytics-cards">
                <div className="card">
                  <h4>User Roles</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={analytics.roles}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={50}
                        label
                      >
                        {analytics.roles.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="card">
                  <h4>Registrations</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={analytics.registrations}>
                      <XAxis dataKey="name" hide />
                      <Tooltip />
                      <Bar dataKey="value" fill="#38bdf8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* EDIT MODAL */}
      {selectedUser && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit User</h3>
            <input
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
            />
            <input
              value={editData.email}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
            />
            <select
              value={editData.role}
              onChange={(e) =>
                setEditData({ ...editData, role: e.target.value })
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <div className="edit-modal-actions">
              <button onClick={updateUser}>Save</button>
              <button onClick={() => setSelectedUser(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOG */}
      {/* ================= AUDIT LOG ================= */}
      <div className="audit-log">
        <h3>Audit Logs</h3>

        {logs.length === 0 ? (
          <p>No logs available</p>
        ) : (
          <>
            <ul>
              {(showAllLogs ? logs : logs.slice(0, 5)).map((log) => (
                <li key={log._id}>
                  <div className="log-info">
                    <strong>{log.action}</strong> on {log.targetUser?.email}
                  </div>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>

            {logs.length > 5 && (
              <button
                className="show-more-btn"
                onClick={() => setShowAllLogs(!showAllLogs)}
              >
                {showAllLogs ? "Show Less ▲" : "Show More ▼"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
