import express from "express";
import {
  getUserFavourites,
  addToFavourites,
  removeFromFavourites,
  removeFromFavouritesByCarId,
  checkFavouritestatus,
} from "../controllers/favouriteControllers.js";
import { authenticateToken } from "../middleware/auth.js"; // Adjust based on your auth middleware

const router = express.Router();

// Apply authentication middleware to all Favourites routes
router.use(authenticateToken);

// Get all Favourites for the current user
router.get("/", getUserFavourites);

// Add a car to Favourites
router.post("/", addToFavourites);

// Remove a car from Favourites by favorite ID
router.delete("/:favoriteId", removeFromFavourites);

// Remove a car from Favourites by car ID
router.delete("/car/:carId", removeFromFavouritesByCarId);

// Check if a car is in Favourites
router.get("/check/:carId", checkFavouritestatus);

export default router;
