import { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import EntryForm from "../Components/EntryForm";
import {
  getEntries,
  addEntry,
  updateEntry,
  deleteEntry,
} from "../Services/api";
import "../styles/dashboard.css";

/* ---------------- NAV SECTIONS ---------------- */
const SECTIONS = {
  DASHBOARD: "dashboard",
  ANALYTICS: "analytics",
};

export default function Dashboard() {
  const { dark, setDark } = useContext(ThemeContext);

  const [entries, setEntries] = useState([]);
  const [activeSection, setActiveSection] = useState(SECTIONS.DASHBOARD);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskInput, setTaskInput] = useState("");
  const [confirmModal, setConfirmModal] = useState({ show: false, task: "" });
  const [showYearCalendar, setShowYearCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const todayIndex = today.getDay();
  const todayStr = today.toDateString();

  const formatToday = () =>
    today.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  /* ---------------- LOAD ENTRIES ---------------- */
  const loadEntries = async () => {
    const res = await getEntries();
    setEntries(res.data);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  /* ---------------- AUTH ---------------- */
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  /* ---------------- TASK HELPERS ---------------- */
  const tasks = useMemo(
    () => [...new Set(entries.map((e) => e.task))],
    [entries],
  );

  const hasTodayEntry = (task) =>
    entries.some(
      (e) => e.task === task && new Date(e.date).toDateString() === todayStr,
    );

  const hasPastEntries = (task) =>
    entries.some(
      (e) => e.task === task && new Date(e.date).toDateString() !== todayStr,
    );

  const toggleCompletion = async (task) => {
    const existing = entries.find(
      (e) => e.task === task && new Date(e.date).toDateString() === todayStr,
    );

    if (existing) {
      await updateEntry(existing._id, { completed: !existing.completed });
    } else {
      await addEntry({ task, date: today, completed: true });
    }

    loadEntries();
  };

  const startEditTask = (task) => {
    if (!hasTodayEntry(task)) return;
    setEditTask(task);
    setTaskInput(task);
  };

  const saveTaskEdit = async () => {
    const todayEntries = entries.filter(
      (e) =>
        e.task === editTask && new Date(e.date).toDateString() === todayStr,
    );
    await Promise.all(
      todayEntries.map((e) => updateEntry(e._id, { task: taskInput })),
    );
    setEditTask(null);
    setTaskInput("");
    loadEntries();
  };

  const confirmDeleteTask = async () => {
    const allEntries = entries.filter((e) => e.task === confirmModal.task);
    await Promise.all(allEntries.map((e) => deleteEntry(e._id)));
    setConfirmModal({ show: false, task: "" });
    loadEntries();
  };

  const isCompleted = (task, dayIndex) => {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const target = new Date(weekStart);
    target.setDate(weekStart.getDate() + dayIndex);
    return entries.some(
      (e) =>
        e.task === task &&
        new Date(e.date).toDateString() === target.toDateString() &&
        e.completed,
    );
  };

  const getTaskProgress = (task) => {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    let completedDays = 0;
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      if (
        entries.some(
          (e) =>
            e.task === task &&
            new Date(e.date).toDateString() === day.toDateString() &&
            e.completed,
        )
      )
        completedDays++;
    }
    return Math.round((completedDays / 7) * 100);
  };

  const dailyStreak = useMemo(() => {
    const completedDates = [
      ...new Set(
        entries
          .filter((e) => e.completed)
          .map((e) => new Date(e.date).toDateString()),
      ),
    ];
    let streak = 0;
    const cursor = new Date(today);
    while (completedDates.includes(cursor.toDateString())) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [entries]);

  const weeklyStats = useMemo(() => {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    return days.map((_, idx) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + idx);
      const completed = entries.filter(
        (e) =>
          new Date(e.date).toDateString() === d.toDateString() && e.completed,
      ).length;
      return { day: days[idx], completed };
    });
  }, [entries]);

  const weeklyCompletionPercent = useMemo(() => {
    const total = weeklyStats.reduce((a, b) => a + b.completed, 0);
    const max = tasks.length * 7;
    return max ? Math.round((total / max) * 100) : 0;
  }, [weeklyStats, tasks.length]);

  return (
    <div className={`dashboard-container ${dark ? "dark" : "light"}`}>
      <div className="dashboard-header">
        <h2>Daily Tracker</h2>
        <div className="dashboard-actions">
          <button onClick={() => setDark(!dark)}>
            {dark ? "☀ Light" : "🌙 Dark"}
          </button>
          <button onClick={logout}>Logout</button>
          <button onClick={() => setShowYearCalendar(true)}>
            📅 Year Calendar
          </button>
        </div>
      </div>

      {/* NAVBAR */}
      <div className="dashboard-nav">
        <button onClick={() => setActiveSection(SECTIONS.DASHBOARD)}>
          📅 Dashboard
        </button>
        <button onClick={() => setActiveSection(SECTIONS.ANALYTICS)}>
          📊 Analytics
        </button>
      </div>

      <div className="dashboard-layout">
        <div className="sidebar">
          <button
            className="sidebar-btn"
            onClick={() => setShowForm(!showForm)}
          >
            ➕ Add Entry
          </button>
        </div>

        <div className="main-content">
          {activeSection === SECTIONS.DASHBOARD && (
            <>
              <div className="today-banner">
                <span>📅 Today</span>
                <strong>{formatToday()}</strong>
              </div>
              <div className="streak-banner">
                🔥 Current Streak: {dailyStreak} days
              </div>

              <div className="completion-ring-card">
                <div
                  className="completion-ring"
                  style={{ "--percent": weeklyCompletionPercent }}
                >
                  <span>{weeklyCompletionPercent}%</span>
                </div>
                <p>Weekly Completion</p>
              </div>

              {showForm && <EntryForm onAdded={loadEntries} />}

              <div className="calendar-grid">
                <div className="calendar-row header">
                  <div className="calendar-cell task-header">Task</div>
                  {days.map((d) => (
                    <div key={d} className="calendar-cell">
                      {d}
                    </div>
                  ))}
                </div>

                {tasks.map((task) => (
                  <div key={task} className="calendar-row">
                    <div className="calendar-cell task-name">
                      <span>{task}</span>
                      {hasTodayEntry(task) && (
                        <div className="task-actions">
                          <button onClick={() => startEditTask(task)}>
                            ✏️
                          </button>
                          <button
                            onClick={async () => {
                              if (hasPastEntries(task))
                                setConfirmModal({ show: true, task });
                              else {
                                const todayEntries = entries.filter(
                                  (e) =>
                                    e.task === task &&
                                    new Date(e.date).toDateString() ===
                                      todayStr,
                                );
                                await Promise.all(
                                  todayEntries.map((e) => deleteEntry(e._id)),
                                );
                                loadEntries();
                              }
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                      <div className="task-progress">
                        <div
                          className="progress-fill"
                          style={{ width: `${getTaskProgress(task)}%` }}
                        />
                      </div>
                    </div>

                    {days.map((_, idx) => (
                      <div
                        key={idx}
                        className={`calendar-cell ${idx === todayIndex ? "today-cell" : "disabled-cell"} ${
                          isCompleted(task, idx) ? "completed" : ""
                        }`}
                        onClick={() =>
                          idx === todayIndex && toggleCompletion(task)
                        }
                      >
                        {isCompleted(task, idx) ? "✔" : ""}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeSection === SECTIONS.ANALYTICS && (
            <div className="analytics-section">
              <h3>📊 Weekly Analytics</h3>

              <svg
                className="line-chart"
                viewBox="0 0 300 150"
                preserveAspectRatio="none"
              >
                <polyline
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  points={weeklyStats
                    .map((d, i) => {
                      const x = (i / 6) * 280 + 10;
                      const y = 140 - d.completed * 18;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                />

                {weeklyStats.map((d, i) => {
                  const x = (i / 6) * 280 + 10;
                  const y = 140 - d.completed * 18;
                  return <circle key={i} cx={x} cy={y} r="4" fill="#22c55e" />;
                })}
              </svg>

              <div className="line-chart-labels">
                {weeklyStats.map((d) => (
                  <span key={d.day}>{d.day}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editTask && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit Task</h3>
            <input
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
            />
            <div className="edit-modal-actions">
              <button onClick={saveTaskEdit}>Save</button>
              <button onClick={() => setEditTask(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {confirmModal.show && (
        <div className="confirm-modal">
          <div className="confirm-modal-content">
            <p>Delete all entries for "{confirmModal.task}"?</p>
            <div className="confirm-modal-actions">
              <button onClick={confirmDeleteTask}>Yes</button>
              <button
                onClick={() => setConfirmModal({ show: false, task: "" })}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YEAR CALENDAR MODAL */}
      {showYearCalendar && (
        <div className="year-calendar-modal">
          <div className="year-calendar-content">
            <h3>Select a Date</h3>
            <div className="year-calendar-grid">
              {Array.from({ length: 12 }, (_, monthIdx) => {
                const firstDay = new Date(
                  today.getFullYear(),
                  monthIdx,
                  1,
                ).getDay();
                const daysInMonth = new Date(
                  today.getFullYear(),
                  monthIdx + 1,
                  0,
                ).getDate();
                const monthName = new Date(
                  today.getFullYear(),
                  monthIdx,
                ).toLocaleString("default", { month: "short" });

                const cells = [];
                for (let i = 0; i < firstDay; i++)
                  cells.push(
                    <div
                      key={`empty-${monthIdx}-${i}`}
                      className="day-cell empty"
                    />,
                  );
                for (let day = 1; day <= daysInMonth; day++) {
                  const dateObj = new Date(today.getFullYear(), monthIdx, day);
                  const hasEntry = entries.some(
                    (e) =>
                      new Date(e.date).toDateString() ===
                      dateObj.toDateString(),
                  );
                  const isSelected =
                    selectedDate &&
                    dateObj.toDateString() === selectedDate.toDateString();

                  cells.push(
                    <div
                      key={`${monthIdx}-${day}`}
                      className={`day-cell ${hasEntry ? "has-entry" : ""} ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedDate(dateObj)}
                    >
                      {day}
                    </div>,
                  );
                }

                return (
                  <div key={monthIdx} className="month-grid">
                    <h4>{monthName}</h4>
                    <div className="days-grid">{cells}</div>
                  </div>
                );
              })}
            </div>

            {selectedDate && (
              <div className="selected-day-report">
                <h4>Entries for {selectedDate.toDateString()}</h4>
                {entries
                  .filter(
                    (e) =>
                      new Date(e.date).toDateString() ===
                      selectedDate.toDateString(),
                  )
                  .map((e) => (
                    <div key={e._id} className={e.completed ? "completed" : ""}>
                      <span>{e.task}</span>
                      <span>{e.completed ? "✔" : "❌"}</span>
                    </div>
                  ))}
              </div>
            )}

            <button
              onClick={() => {
                setShowYearCalendar(false);
                setSelectedDate(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Floating Add Button */}
      <button
        className="floating-add-btn"
        onClick={() => setShowForm(!showForm)}
      >
        ➕
      </button>
    </div>
  );
}
