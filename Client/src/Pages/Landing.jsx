import { Link } from "react-router-dom";
import "../styles/landing.css";

export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <h2 className="logo">DailyTracker</h2>
        <div className="nav-links">
          <Link to="/register" className="nav-link nav-btn">
            Get Started
          </Link>
        </div>
      </nav>

      <section className="hero">
        <h1 className="hero-title">
          Track Your Day. AAJ karega Thabhi aage Badega
        </h1>
        <p className="hero-subtitle">
          A simple daily tracker to log your tasks, thoughts, and progress — all
          in one place.
        </p>

        <div className="hero-actions">
          <Link to="/register" className="primary-btn">
            Start Tracking
          </Link>
          <Link to="/" className="secondary-btn">
            Login
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>📝 Daily Logs</h3>
          <p>Write and save your daily activities with ease.</p>
        </div>

        <div className="feature-card">
          <h3>📊 Stay Organized</h3>
          <p>View all your entries in one clean dashboard.</p>
        </div>

        <div className="feature-card">
          <h3>🔒 Secure</h3>
          <p>Your data is private and linked only to your account.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} DailyTracker ( MK )</p>
      </footer>
    </div>
  );
}
