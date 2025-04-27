import mongoose from "mongoose";

const dimensionSchema = new mongoose.Schema({
  length: { type: String, required: true },
  width: { type: String, required: true },
  height: { type: String, required: true },
  wheelbase: { type: String, required: true },
});

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, required: true },
});

const carSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    brand: { type: String, required: true },
    image: { type: String, required: true },
    images: [{ type: String, required: true }],
    description: { type: String, required: true },
    engine: { type: String, required: true },
    driveType: { type: String, required: true },
    category: { type: String, required: true },
    horsepower: { type: String, required: true },
    torque: { type: String, required: true },
    topSpeed: { type: String, required: true },
    acceleration: { type: String, required: true },
    brakingDistance: { type: String },
    transmission: { type: String, required: true },
    fuelType: { type: String, required: true },
    mileage: { type: String, required: true },
    fuelTankCapacity: { type: String, required: true },
    dimensions: { type: dimensionSchema, required: true },
    groundClearance: { type: String, required: true },
    cargoSpace: { type: String, required: true },
    curbWeight: { type: String, required: true },
    safetyRating: { type: String, required: true },
    airbags: { type: String, required: true },
    price: { type: String, required: true },
    launchDate: { type: Date, required: true },
    features: [{ type: String, required: true }],
    pros: [{ type: String }],
    cons: [{ type: String }],
    safetyFeatures: [{ type: String }],
    colors: [{ type: colorSchema }],
  },
  { timestamps: true }
);

const Car = mongoose.model("Car", carSchema);

export default Car;
