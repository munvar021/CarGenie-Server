import Car from "../models/carModel.js";
import Brand from "../models/brandModel.js";

export const searchBrands = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(200).json({ brands: [] });
    }

    const regex = new RegExp(query, "i");

    const brands = await Brand.find({ name: regex })
      .select("name logo")
      .limit(5);

    res.status(200).json({ brands });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching brands", error: error.message });
  }
};

export const searchCars = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(200).json({ cars: [] });
    }

    const regex = new RegExp(query, "i");

    const cars = await Car.find({
      $or: [
        { name: regex },
        { brand: regex },
        { category: regex },
        { fuelType: regex },
      ],
    })
      .select("name brand image category price")
      .limit(8);

    res.status(200).json({ cars });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching cars", error: error.message });
  }
};

export const combinedSearch = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(200).json({ results: { brands: [], cars: [] } });
    }

    const regex = new RegExp(query, "i");

    const brandsPromise = Brand.find({ name: regex })
      .select("name logo")
      .limit(3);

    const carsPromise = Car.find({
      $or: [
        { name: regex },
        { brand: regex },
        { category: regex },
        { fuelType: regex },
      ],
    })
      .select("name brand image category price")
      .limit(5);

    const [brands, cars] = await Promise.all([brandsPromise, carsPromise]);

    res.status(200).json({ results: { brands, cars } });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error performing search", error: error.message });
  }
};

export const advancedSearch = async (req, res) => {
  try {
    const {
      query,
      brand,
      category,
      minPrice,
      maxPrice,
      fuelType,
      transmission,
      sortBy,
    } = req.query;

    const filter = {};

    // Build filter conditions
    if (query && query.length >= 2) {
      const regex = new RegExp(query, "i");
      filter.$or = [{ name: regex }, { description: regex }];
    }

    if (brand) filter.brand = brand;
    if (category) filter.category = category;
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;

    // Handle price range
    if (minPrice || maxPrice) {
      filter.price = {};
      // Convert string price to number for comparison
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }

    // Determine sort order
    let sort = {};
    switch (sortBy) {
      case "price_asc":
        sort = { price: 1 };
        break;
      case "price_desc":
        sort = { price: -1 };
        break;
      case "newest":
        sort = { launchDate: -1 };
        break;
      default:
        sort = { name: 1 };
    }

    const cars = await Car.find(filter)
      .select("name brand image category price fuelType transmission")
      .sort(sort)
      .limit(20);

    res.status(200).json({ cars, totalCount: cars.length });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in advanced search", error: error.message });
  }
};
