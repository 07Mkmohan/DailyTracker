import mongoose from "mongoose";

const DailyEntrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  task: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  entries: [
    {
      date: { type: Date, required: true },
      completed: { type: Boolean, default: false },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

DailyEntrySchema.pre("save", function () {
  this.updatedAt = Date.now();
});

DailyEntrySchema.pre("findOneAndUpdate", function () {
  this.set({ updatedAt: Date.now() });
});

export default mongoose.model("DailyEntry", DailyEntrySchema);
