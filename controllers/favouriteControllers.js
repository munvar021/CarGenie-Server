import Favorite from "../models/favouriteModel.js";
import mongoose from "mongoose";

export const getUserFavourites = async (req, res) => {
  try {
    const userId = req.user.userId;

    const Favourites = await Favorite.find({ user: userId });

    return res.status(200).json({
      success: true,
      count: Favourites.length,
      data: Favourites,
    });
  } catch (error) {
    console.error("Error fetching Favourites:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Favourites",
      error: error.message,
    });
  }
};

export const addToFavourites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { carId, carModel, brand, year, price, image, description } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID format",
      });
    }

    const existingFavorite = await Favorite.findOne({
      user: userId,
      itemId: carId,
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: "This car is already in your Favourites",
      });
    }

    const favorite = new Favorite({
      user: userId,
      itemType: "car",
      itemId: carId,
      carModel,
      brand,
      year,
      price,
      image,
      description,
    });

    await favorite.save();

    return res.status(201).json({
      success: true,
      message: "Car added to Favourites successfully",
      data: favorite,
    });
  } catch (error) {
    console.error("Error adding to Favourites:", error);

    // Handle duplicate entry error from MongoDB (if compound index fails)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This car is already in your Favourites",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add to Favourites",
      error: error.message,
    });
  }
};

// Remove a car from Favourites
export const removeFromFavourites = async (req, res) => {
  try {
    const userId = req.user.userId; // Changed from req.user._id to req.user.userId
    const { favoriteId } = req.params;

    // Validate favoriteId
    if (!mongoose.Types.ObjectId.isValid(favoriteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid favorite ID format",
      });
    }

    // Find and remove the favorite
    const favorite = await Favorite.findOneAndDelete({
      _id: favoriteId,
      user: userId,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message:
          "Favorite not found or you do not have permission to remove it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Car removed from Favourites successfully",
    });
  } catch (error) {
    console.error("Error removing from Favourites:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove from Favourites",
      error: error.message,
    });
  }
};

// Remove a car from Favourites by car ID (alternative method)
export const removeFromFavouritesByCarId = async (req, res) => {
  try {
    const userId = req.user.userId; // Changed from req.user._id to req.user.userId
    const { carId } = req.params;

    // Validate carId
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID format",
      });
    }

    // Find and remove the favorite
    const favorite = await Favorite.findOneAndDelete({
      itemId: carId,
      user: userId,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "This car was not in your Favourites",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Car removed from Favourites successfully",
    });
  } catch (error) {
    console.error("Error removing from Favourites:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove from Favourites",
      error: error.message,
    });
  }
};

// Check if a car is in Favourites
export const checkFavouritestatus = async (req, res) => {
  try {
    const userId = req.user.userId; // Changed from req.user._id to req.user.userId
    const { carId } = req.params;

    // Validate carId
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID format",
      });
    }

    // Check if in Favourites
    const favorite = await Favorite.findOne({
      user: userId,
      itemId: carId,
    });

    return res.status(200).json({
      success: true,
      isFavorite: !!favorite,
      favoriteId: favorite ? favorite._id : null,
    });
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check favorite status",
      error: error.message,
    });
  }
};
