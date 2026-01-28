import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import "../styles/landing.css";

const features = [
  {
    icon: "📝",
    title: "Daily Logs",
    desc: "Log your tasks and thoughts daily.",
  },
  {
    icon: "📅",
    title: "Calendar View",
    desc: "Track progress across the full year.",
  },
  {
    icon: "📊",
    title: "Weekly Reports",
    desc: "Visual weekly productivity insights.",
  },
  { icon: "🔥", title: "Streaks", desc: "Stay motivated with habit streaks." },
  {
    icon: "🎯",
    title: "Goal Tracking",
    desc: "Set goals and monitor progress.",
  },
  { icon: "🔔", title: "Reminders", desc: "Never miss a task again." },
  { icon: "🌙", title: "Dark Mode", desc: "Beautiful dark & light themes." },
  { icon: "🔐", title: "Secure", desc: "JWT based authentication." },
  {
    icon: "⚡",
    title: "Fast & Simple",
    desc: "Optimized for speed and focus.",
  },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing">
      {/* NAVBAR */}
      <nav className="landing-nav">
        <h2 className="logo">DailyTracker</h2>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link to="/register" className="nav-link nav-btn">
            Get Started
          </Link>
        </div>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>
      </nav>

      {/* HERO */}
      <motion.section
        className="hero"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="hero-title">
          Track Your Day.
          <br />
          Progress isn’t about perfection — it’s about showing up. 🚀
        </h1>
        <p className="hero-subtitle">
          Build habits, track progress, and stay consistent — all in one
          powerful daily tracker.
        </p>

        <div className="hero-actions">
          <Link to="/register" className="primary-btn">
            Start Tracking
          </Link>
          <Link to="/login" className="secondary-btn">
            Login
          </Link>
        </div>
      </motion.section>

      {/* MOTIVATION */}
      <motion.section
        className="motivation"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <p className="motivation-line">
          “Aaj ka ek chhota kadam, kal ki badi jeet ban jata hai.”
        </p>

        <p className="motivation-line highlight">
          “Roz likho, roz sudhro — Success mangne se nhi mehanat se milti hai.”
        </p>
      </motion.section>

      {/* FEATURES */}
      <section className="features">
        {features.map((f, i) => (
          <motion.div
            className="feature-card"
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </motion.div>
        ))}
      </section>
      <motion.section
        className="motivation"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <p className="motivation-line">
          “Perfect hone ka intezaar mat karo, shuru karna hi perfect hai.”
        </p>

        <p className="motivation-line highlight">
          “The mountain does not need to declare it's height: the valley knows.”
        </p>
      </motion.section>
      {/* CTA */}
      <motion.section
        className="cta"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2>Start Building Better Days Today</h2>
        <Link to="/register" className="cta-btn">
          Create Free Account
        </Link>
      </motion.section>

      {/* FOOTER */}
      <footer className="landing-footer">
        © {new Date().getFullYear()} DailyTracker • Built with ❤️ by MK
      </footer>
    </div>
  );
}
