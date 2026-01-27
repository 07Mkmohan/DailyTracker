import { useState } from "react";
import { addEntry } from "../Services/api";
import Toast from "./Toast";
import "../styles/entry.css";

export default function EntryForm({ onAdded }) {
  const [data, setData] = useState({
    task: "", // task is required
    description: "",
  });
  const [showToast, setShowToast] = useState(false);
  const [errorToast, setErrorToast] = useState(""); // ✅ for backend errors

  const submit = async () => {
    if (!data.task.trim()) {
      setErrorToast("Task is required!");
      setTimeout(() => setErrorToast(""), 2000);
      return;
    }

    try {
      const res = await addEntry({
        ...data,
        completed: false,
        date: new Date(),
      });

      setShowToast(true);
      setData({ task: "", description: "" });
      onAdded(); // refresh dashboard entries

      setTimeout(() => setShowToast(false), 1500);
    } catch (err) {
      const message =
        err.response?.data?.error || err.response?.data?.message || err.message;
      console.error("Failed to add entry:", message);
      setErrorToast(message);
      setTimeout(() => setErrorToast(""), 2500);
    }
  };

  return (
    <>
      <div className="entry-form slide-up">
        <input
          className="entry-input"
          placeholder="Task"
          value={data.task}
          onChange={(e) => setData({ ...data, task: e.target.value })}
        />

        <input
          className="entry-input"
          placeholder="Description"
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
        />

        <button className="entry-button" onClick={submit}>
          Add Entry
        </button>
      </div>

      {/* Success toast */}
      <Toast message="Entry Added ✅" show={showToast} />

      {/* Error toast */}
      {errorToast && <Toast message={`❌ ${errorToast}`} show={true} />}
    </>
  );
}
