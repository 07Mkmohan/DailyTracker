// routes/adminLogs.js
import express from "express";
import AdminLog from "../Model/AdminLog.js";
import { protect } from "../Middleware/auth.js";
import { admin } from "../Middleware/adminMiddleware.js";

const router = express.Router();

// GET all admin logs
router.get("/", protect, admin, async (req, res) => {
  try {
    const logs = await AdminLog.find()
      .populate("targetUser", "email")
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
