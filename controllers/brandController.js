import Brand from "../models/brandModel.js";
import Car from "../models/carModel.js";
import { cloudinary } from "../config/cloudinary.js";

export const createBrand = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a logo image" });
    }

    const name = req.body.name || "";
    const description = req.body.description || "";
    const country = req.body.country || "";
    const founded = req.body.founded || 0;
    const website = req.body.website || "";
    const parentCompany = req.body.parentCompany || "";
    const ceo = req.body.ceo || "";
    const revenue = req.body.revenue || "";
    const employees = req.body.employees || 0;

    if (!name || !description || !country) {
      return res.status(400).json({
        message: "Missing required fields",
        details: {
          name: name ? "✓" : "✗",
          description: description ? "✓" : "✗",
          country: country ? "✓" : "✗",
        },
      });
    }

    const newBrand = new Brand({
      name,
      logo: req.file.path,
      description,
      country,
      founded,
      website,
      parentCompany,
      ceo,
      revenue,
      employees,
    });

    const savedBrand = await newBrand.save();
    res.status(201).json(savedBrand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const brandId = req.params.id;
    const brand = await Brand.findById(brandId);

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const name = req.body.name || brand.name;
    const description = req.body.description || brand.description;
    const country = req.body.country || brand.country;
    const founded = req.body.founded || brand.founded;
    const website = req.body.website || brand.website;
    const parentCompany = req.body.parentCompany || brand.parentCompany;
    const ceo = req.body.ceo || brand.ceo;
    const revenue = req.body.revenue || brand.revenue;
    const employees = req.body.employees || brand.employees;

    if (!name || !description || !country) {
      return res.status(400).json({
        message: "Missing required fields",
        details: {
          name: name ? "✓" : "✗",
          description: description ? "✓" : "✗",
          country: country ? "✓" : "✗",
        },
      });
    }

    let logoPath = brand.logo;
    if (req.file) {
      if (brand.logo.includes("cloudinary")) {
        const logoId = brand.logo.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`cargenie/${logoId}`);
      }
      logoPath = req.file.path;
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      brandId,
      {
        name,
        logo: logoPath,
        description,
        country,
        founded,
        website,
        parentCompany,
        ceo,
        revenue,
        employees,
      },
      { new: true }
    );

    res.status(200).json(updatedBrand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBrands = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalBrands = await Brand.countDocuments({});
    const brands = await Brand.find({})
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      brands,
      currentPage: page,
      totalPages: Math.ceil(totalBrands / limit),
      totalItems: totalBrands,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const getBrandNames = async (req, res) => {
//   try {
//     const brandNames = await Brand.find({}, "name").sort({ name: 1 });
//     res.status(200).json(brandNames);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const getBrandNames = async (req, res) => {
  try {
    const brandNames = await Brand.find({}, "name logo").sort({ name: 1 });
    res.status(200).json(brandNames);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id).populate("cars");

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    if (brand.cars && brand.cars.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete brand with associated cars. Please delete the cars first.",
      });
    }

    const logoId = brand.logo.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`cargenie/${logoId}`);

    await Brand.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const getBrandDetails = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const brand = await Brand.findById(id).populate({
//       path: "cars",
//       options: {
//         limit: parseInt(req.query.limit) || 10,
//         skip:
//           ((parseInt(req.query.page) || 1) - 1) *
//           (parseInt(req.query.limit) || 10),
//       },
//     });

//     if (!brand) {
//       return res.status(404).json({ message: "Brand not found" });
//     }

//     const totalCars = await Car.countDocuments({ brandId: id });

//     res.status(200).json({
//       brand,
//       carsCurrentPage: parseInt(req.query.page) || 1,
//       carsTotalPages: Math.ceil(totalCars / (parseInt(req.query.limit) || 10)),
//       carsTotalItems: totalCars,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const getBrandDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id).populate("cars");

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.status(200).json({ brand });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
