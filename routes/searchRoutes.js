import express from "express";
import {
  searchBrands,
  searchCars,
  combinedSearch,
  advancedSearch,
} from "../controllers/searchController.js";

const router = express.Router();

router.get("/brands", searchBrands);
router.get("/cars", searchCars);
router.get("/combined", combinedSearch);
router.get("/advanced", advancedSearch);

export default router;
