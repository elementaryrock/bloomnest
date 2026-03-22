const mongoose = require("mongoose");

const siblingEntrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 40,
    },
    feeling: {
      type: String,
      enum: ["happy", "sad", "anxious", "neutral", "frustrated"],
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 160,
    },
  },
  { _id: false },
);

const familyWellbeingSchema = new mongoose.Schema({
  specialId: {
    type: String,
    required: true,
    index: true,
  },
  loggedBy: {
    type: String,
    enum: ["parent", "sibling"],
    default: "parent",
  },
  weekStart: {
    type: Date,
    required: true,
  },
  stressLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  siblingEntries: [siblingEntrySchema],
  notes: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate logs for the same week
familyWellbeingSchema.index({ specialId: 1, weekStart: 1 }, { unique: true });

familyWellbeingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("FamilyWellbeing", familyWellbeingSchema);
