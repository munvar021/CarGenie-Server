import Car from "../models/carModel.js";
import Brand from "../models/brandModel.js";
import { cloudinary } from "../config/cloudinary.js";

export const createCar = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "Please upload at least one car image" });
    }

    const name = req.body.name || "";
    const brandId = req.body.brandId || "";
    const description = req.body.description || "";
    const engine = req.body.engine || "";
    const driveType = req.body.driveType || "";
    const category = req.body.category || "";
    const horsepower = req.body.horsepower || "";
    const torque = req.body.torque || "";
    const topSpeed = req.body.topSpeed || "";
    const acceleration = req.body.acceleration || "";
    const brakingDistance = req.body.brakingDistance || "";
    const transmission = req.body.transmission || "";
    const fuelType = req.body.fuelType || "";
    const mileage = req.body.mileage || "";
    const fuelTankCapacity = req.body.fuelTankCapacity || "";
    const length = req.body.length || "";
    const width = req.body.width || "";
    const height = req.body.height || "";
    const wheelbase = req.body.wheelbase || "";
    const groundClearance = req.body.groundClearance || "";
    const cargoSpace = req.body.cargoSpace || "";
    const curbWeight = req.body.curbWeight || "";

    const safetyRating = req.body.safetyRating || "";
    const airbags = req.body.airbags || "";
    const price = req.body.price || "";
    const launchDate = req.body.launchDate || new Date();

    if (!name || !brandId || !description || !engine) {
      return res.status(400).json({
        message: "Missing required fields",
        details: {
          name: name ? "✓" : "✗",
          brandId: brandId ? "✓" : "✗",
          description: description ? "✓" : "✗",
          engine: engine ? "✓" : "✗",
        },
      });
    }

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const images = req.files.map((file) => file.path);

    const parsedFeatures = req.body.features
      ? typeof req.body.features === "string"
        ? JSON.parse(req.body.features)
        : req.body.features
      : [];
    const parsedPros = req.body.pros
      ? typeof req.body.pros === "string"
        ? JSON.parse(req.body.pros)
        : req.body.pros
      : [];
    const parsedCons = req.body.cons
      ? typeof req.body.cons === "string"
        ? JSON.parse(req.body.cons)
        : req.body.cons
      : [];
    const parsedSafetyFeatures = req.body.safetyFeatures
      ? typeof req.body.safetyFeatures === "string"
        ? JSON.parse(req.body.safetyFeatures)
        : req.body.safetyFeatures
      : [];
    const parsedColors = req.body.colors
      ? typeof req.body.colors === "string"
        ? JSON.parse(req.body.colors)
        : req.body.colors
      : [];

    const dimensions = {
      length,
      width,
      height,
      wheelbase,
    };

    const newCar = new Car({
      name,
      brandId,
      brand: brand.name,
      image: images[0],
      images,
      description,
      engine,
      driveType,
      category,
      horsepower,
      torque,
      topSpeed,
      acceleration,
      brakingDistance,
      transmission,
      fuelType,
      mileage,
      fuelTankCapacity,
      dimensions,
      groundClearance,
      cargoSpace,
      curbWeight,
      safetyRating: safetyRating,
      airbags: airbags,
      price,
      launchDate: new Date(launchDate),
      features: parsedFeatures,
      pros: parsedPros,
      cons: parsedCons,
      safetyFeatures: parsedSafetyFeatures,
      colors: parsedColors,
    });

    const savedCar = await newCar.save();

    await Brand.findByIdAndUpdate(brandId, {
      $push: { cars: savedCar._id },
    });

    res.status(201).json(savedCar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBasicInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, launchDate, price, engine, category, description } =
      req.body;

    if (
      !name ||
      !brand ||
      !launchDate ||
      !price ||
      !engine ||
      !category ||
      !description
    ) {
      return res.status(400).json({
        message: "Missing required fields",
        details: {
          name: name ? "✓" : "✗",
          brand: brand ? "✓" : "✗",
          launchDate: launchDate ? "✓" : "✗",
          price: price ? "✓" : "✗",
          engine: engine ? "✓" : "✗",
          category: category ? "✓" : "✗",
          description: description ? "✓" : "✗",
        },
      });
    }

    const updatedCar = await Car.findByIdAndUpdate(
      id,
      {
        name,
        brand,
        launchDate,
        price,
        engine,
        category,
        description,
      },
      { new: true, runValidators: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json(updatedCar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      horsepower,
      torque,
      topSpeed,
      acceleration,
      brakingDistance,
      driveType,
      transmission,
      fuelType,
      mileage,
      fuelTankCapacity,
    } = req.body;

    if (
      !horsepower ||
      !torque ||
      !topSpeed ||
      !acceleration ||
      !driveType ||
      !transmission ||
      !fuelType ||
      !mileage ||
      !fuelTankCapacity
    ) {
      return res.status(400).json({
        message: "Missing required fields",
        details: {
          horsepower: horsepower ? "✓" : "✗",
          torque: torque ? "✓" : "✗",
          topSpeed: topSpeed ? "✓" : "✗",
          acceleration: acceleration ? "✓" : "✗",
          driveType: driveType ? "✓" : "✗",
          transmission: transmission ? "✓" : "✗",
          fuelType: fuelType ? "✓" : "✗",
          mileage: mileage ? "✓" : "✗",
          fuelTankCapacity: fuelTankCapacity ? "✓" : "✗",
        },
      });
    }

    const updatedCar = await Car.findByIdAndUpdate(
      id,
      {
        horsepower,
        torque,
        topSpeed,
        acceleration,
        brakingDistance,
        driveType,
        transmission,
        fuelType,
        mileage,
        fuelTankCapacity,
      },
      { new: true, runValidators: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json(updatedCar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDimensions = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      length,
      width,
      height,
      wheelbase,
      groundClearance,
      cargoSpace,
      curbWeight,
      colors,
    } = req.body;

    if (
      !length ||
      !width ||
      !height ||
      !wheelbase ||
      !groundClearance ||
      !cargoSpace ||
      !curbWeight
    ) {
      return res.status(400).json({
        message: "Missing required fields",
        details: {
          length: length ? "✓" : "✗",
          width: width ? "✓" : "✗",
          height: height ? "✓" : "✗",
          wheelbase: wheelbase ? "✓" : "✗",
          groundClearance: groundClearance ? "✓" : "✗",
          cargoSpace: cargoSpace ? "✓" : "✗",
          curbWeight: curbWeight ? "✓" : "✗",
        },
      });
    }

    if (colors && !Array.isArray(colors)) {
      return res.status(400).json({ message: "Colors must be an array" });
    }

    const dimensions = {
      length,
      width,
      height,
      wheelbase,
    };

    const update = {
      dimensions,
      groundClearance,
      cargoSpace,
      curbWeight,
    };

    if (colors && colors.length > 0) {
      update.colors = colors;
    }

    const updatedCar = await Car.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json(updatedCar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFeatures = async (req, res) => {
  try {
    const { id } = req.params;
    const { safetyRating, airbags, safetyFeatures, features, pros, cons } =
      req.body;

    if (!safetyRating || !airbags || !features) {
      return res.status(400).json({
        message: "Missing required fields",
        details: {
          safetyRating: safetyRating ? "✓" : "✗",
          airbags: airbags ? "✓" : "✗",
          features: features ? "✓" : "✗",
        },
      });
    }

    if (features && !Array.isArray(features)) {
      return res.status(400).json({ message: "Features must be an array" });
    }

    if (safetyFeatures && !Array.isArray(safetyFeatures)) {
      return res
        .status(400)
        .json({ message: "Safety features must be an array" });
    }

    if (pros && !Array.isArray(pros)) {
      return res.status(400).json({ message: "Pros must be an array" });
    }

    if (cons && !Array.isArray(cons)) {
      return res.status(400).json({ message: "Cons must be an array" });
    }

    const updatedCar = await Car.findByIdAndUpdate(
      id,
      {
        safetyRating,
        airbags,
        features,
        ...(safetyFeatures && { safetyFeatures }),
        ...(pros && { pros }),
        ...(cons && { cons }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json(updatedCar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateImages = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "Please upload at least one image" });
    }

    const newImagePaths = req.files.map((file) => file.path);

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const allImages = [...car.images, ...newImagePaths];

    const primaryImage = car.image || newImagePaths[0];

    const updatedCar = await Car.findByIdAndUpdate(
      id,
      {
        image: primaryImage,
        images: allImages,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedCar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (!car.images.includes(imageUrl)) {
      return res.status(404).json({ message: "Image not found for this car" });
    }

    const urlParts = imageUrl.split("/");
    const filenameWithExtension = urlParts[urlParts.length - 1];
    const publicId = `cargenie/${filenameWithExtension.split(".")[0]}`;

    await cloudinary.uploader.destroy(publicId);

    const updatedImages = car.images.filter((img) => img !== imageUrl);

    let updateData = { images: updatedImages };
    if (car.image === imageUrl && updatedImages.length > 0) {
      updateData.image = updatedImages[0];
    }

    const updatedCar = await Car.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Image deleted successfully",
      car: updatedCar,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCars = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const brand = req.query.brand;
    const category = req.query.category;
    const fuelType = req.query.fuelType;
    const transmission = req.query.transmission;

    const filter = {};

    if (brand) filter.brand = brand;
    if (category) filter.category = category;
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;

    const totalCars = await Car.countDocuments(filter);
    const cars = await Car.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      cars,
      currentPage: page,
      totalPages: Math.ceil(totalCars / limit),
      totalItems: totalCars,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCars = async (req, res) => {
  try {
    const cars = await Car.find().populate("brandId", "name logo");
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCarDetails = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate("brandId");

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json(car);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid car ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (car.brandId) {
      await Brand.findByIdAndUpdate(car.brandId, {
        $pull: { cars: car._id },
      });
    }

    if (car.images?.length) {
      for (const img of car.images) {
        if (img.includes("cloudinary")) {
          try {
            const imgId = img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`cargenie/${imgId}`);
          } catch (cloudinaryError) {
            console.error("Cloudinary deletion error:", cloudinaryError);
          }
        }
      }
    }

    await Car.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Car deleted successfully" });
  } catch (error) {
    console.error("Error deleting car:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid car ID format" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
