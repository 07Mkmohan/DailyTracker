import express from "express";
import mongoose from "mongoose";
import User from "../Model/UserModel.js";
import Entry from "../Model/DailyEntryModel.js";
import AdminLog from "../Model/AdminLog.js";
import { protect } from "../Middleware/auth.js";
import { admin } from "../Middleware/adminMiddleware.js";

const router = express.Router();

// ✅ GET all users
router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ UPDATE user
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // 🚫 Prevent admin editing himself
    if (req.user._id.toString() === id) {
      return res.status(403).json({ message: "Admin cannot edit himself" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.role = role ?? user.role;

    await user.save();

    // 📝 Audit log
    await AdminLog.create({
      adminId: req.user._id,
      action: "UPDATED_USER",
      targetUser: user._id,
    });

    const updatedUser = await User.findById(id).select("-password");
    res.json(updatedUser);
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// ✅ DELETE user
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🚫 Prevent deleting last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res
          .status(403)
          .json({ message: "Cannot delete the last admin" });
      }
    }

    await user.deleteOne();

    // 📝 Audit log
    await AdminLog.create({
      adminId: req.user._id,
      action: "DELETED_USER",
      targetUser: user._id,
    });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/entries/:userId", protect, admin, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const entries = await Entry.find({ user: userId }); // fetch user entries
    res.json(entries);
  } catch (err) {
    console.error("Fetch user entries error:", err);
    res.status(500).json({ message: "Failed to fetch entries" });
  }
});

export default router;
