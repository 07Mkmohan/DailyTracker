import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import userRoutes from "./Routes/Users.js";
import entryRoutes from "./Routes/Entries.js";
import adminUsersRoutes from "./Routes/adminUsers.js";
import adminLogsRoutes from "./Routes/adminLogs.js";
import User from "./Model/UserModel.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://daily-tracker-lwcr.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/* ===================== MIDDLEWARE ===================== */
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Daily Tracker API is running 🚀",
  });
});

app.get("/health", (req, res) => {
  res.status(200).send("healthy");
});

/* ===================== ROUTES ===================== */
app.use("/api/users", userRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/admin/logs", adminLogsRoutes);
app.use("/api/entries", entryRoutes);

/* ===================== DB CONNECTION ===================== */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    /* ===== Create Admin from ENV (once) ===== */
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn("⚠️ ADMIN_EMAIL or ADMIN_PASSWORD missing in .env");
    } else {
      const existingAdmin = await User.findOne({ email: adminEmail });

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await User.create({
          name: "Mickey Admin",
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
        });

        console.log(`✅ Admin created: ${adminEmail}`);
      } else {
        console.log("ℹ️ Admin user already exists");
      }
    }

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
