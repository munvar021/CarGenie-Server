import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logo: { type: String, required: true },
    description: { type: String, required: true },
    country: { type: String, required: true },
    dateAdded: { type: Date, default: Date.now },
    founded: { type: Number, default: 0 },
    website: { type: String, default: "#" },
    parentCompany: { type: String, default: "" },
    ceo: { type: String, default: "Unknown" },
    revenue: { type: String, default: "Unknown" },
    employees: { type: Number, default: 0 },
    cars: [{ type: mongoose.Schema.Types.ObjectId, ref: "Car" }],
  },
  { timestamps: true }
);

const Brand = mongoose.model("Brand", brandSchema);

export default Brand;
