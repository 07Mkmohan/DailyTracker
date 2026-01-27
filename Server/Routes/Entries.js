import express from "express";
import Entry from "../Model/DailyEntryModel.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

// CREATE ENTRY
router.post("/", protect, async (req, res) => {
  try {
    if (!req.body.task) {
      return res.status(400).json({ error: "Task is required" });
    }

    const entry = await Entry.create({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error("Error creating entry:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET USER ENTRIES
router.get("/", protect, async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user._id }).sort({
      date: -1,
    });
    res.json(entries);
  } catch (err) {
    console.error("Error fetching entries:", err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE ENTRY
router.put("/:id", protect, async (req, res) => {
  try {
    const entry = await Entry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true },
    );

    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json(entry);
  } catch (err) {
    console.error("Error updating entry:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE ENTRY
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await Entry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) return res.status(404).json({ error: "Entry not found" });
    res.json({ message: "Entry deleted" });
  } catch (err) {
    console.error("Error deleting entry:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
