import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemType: {
      type: String,
      default: "car",
      enum: ["car"],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    carModel: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
    },
    price: {
      type: String,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

favouriteSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });

export default mongoose.model("Favourite", favouriteSchema);
