import { useState } from "react";
import { deleteEntry, updateEntry } from "../Services/api";
import "../styles/entry.css";

const isToday = (date) =>
  new Date(date).toDateString() === new Date().toDateString();

export default function EntryList({ entries, refresh }) {
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    task: "",
    description: "",
  });

  const [confirmEntry, setConfirmEntry] = useState(null);

  const startEdit = (entry) => {
    setEditId(entry._id);
    setEditData({
      task: entry.task,
      description: entry.description,
    });
  };

  const saveEdit = async (id) => {
    await updateEntry(id, editData);
    setEditId(null);
    refresh();
  };

  const handleDeleteClick = async (entry) => {
    // ✅ TODAY → delete instantly
    if (isToday(entry.date)) {
      await deleteEntry(entry._id);
      refresh();
      return;
    }

    // ⛔ PREVIOUS DAY → confirm
    setConfirmEntry(entry);
  };

  const confirmDelete = async () => {
    if (!confirmEntry) return;
    await deleteEntry(confirmEntry._id);
    setConfirmEntry(null);
    refresh();
  };

  return (
    <>
      <div className="entry-list">
        {entries.map((e) => (
          <div className="entry-card fade-in" key={e._id}>
            {editId === e._id ? (
              <>
                <input
                  className="entry-input"
                  value={editData.task}
                  onChange={(ev) =>
                    setEditData({ ...editData, task: ev.target.value })
                  }
                />
                <input
                  className="entry-input"
                  value={editData.description}
                  onChange={(ev) =>
                    setEditData({ ...editData, description: ev.target.value })
                  }
                />

                <div className="entry-actions">
                  <button onClick={() => saveEdit(e._id)}>Save</button>
                  <button onClick={() => setEditId(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h4 className="entry-title">{e.task}</h4>
                <p className="entry-desc">{e.description}</p>

                <div className="entry-actions">
                  <button onClick={() => startEdit(e)}>Edit</button>
                  <button onClick={() => handleDeleteClick(e)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 🔥 CONFIRM POPUP */}
      {confirmEntry && (
        <div className="confirm-modal">
          <div className="confirm-modal-content">
            <p>
              Do you really want to delete the entry from{" "}
              <strong>{new Date(confirmEntry.date).toDateString()}</strong>?
            </p>

            <div className="confirm-modal-actions">
              <button onClick={confirmDelete}>Yes, Delete</button>
              <button onClick={() => setConfirmEntry(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
