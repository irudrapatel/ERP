import mongoose from "mongoose";

const boxSchema = new mongoose.Schema(
  {
    boxNo: { type: String, required: true },
    partUIDs: { type: [String], required: true }, // Array of part UIDs
    totalParts: { type: Number, default: 0 }, // Automatically calculated
  },
  { _id: false }
);


const readyCameraSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: "category", required: true },
    boxes: [boxSchema], // Each entry contains boxNo and partsUid
    description: { type: String, default: "" }, // Optional description field
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Add user reference
  },
  { timestamps: true }
);

const ReadyCameraModel =
  mongoose.models.readycamera || mongoose.model("readycamera", readyCameraSchema);

export default ReadyCameraModel;
