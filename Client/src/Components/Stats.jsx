import "../styles/stats.css";

export default function Stats({ entries }) {
  const dates = entries.map((e) => new Date(e.date).toDateString());
  const uniqueDays = new Set(dates);

  return (
    <div className="stats">
      <div className="stat-card">
        <h3>{entries.length}</h3>
        <p>Total Entries</p>
      </div>

      <div className="stat-card">
        <h3>{uniqueDays.size}</h3>
        <p>Active Days</p>
      </div>
    </div>
  );
}
