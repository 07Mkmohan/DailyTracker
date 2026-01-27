import "../styles/calendar.css";

export default function CalendarView({ entries }) {
  const days = {};

  entries.forEach((e) => {
    const d = new Date(e.date).toDateString();
    days[d] = true;
  });

  return (
    <div className="calendar">
      {Object.keys(days).map((day) => (
        <div className="calendar-day" key={day}>
          ✅ {day}
        </div>
      ))}
    </div>
  );
}
