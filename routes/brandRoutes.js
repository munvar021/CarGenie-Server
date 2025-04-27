import express from "express";
import {
  getAllBrands,
  getBrandNames,
  createBrand,
  updateBrand,
  deleteBrand,
  getBrandDetails,
} from "../controllers/brandController.js";
import { upload } from "../config/cloudinary.js";
import { verifyAdminToken } from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/", getAllBrands);
router.get("/names", getBrandNames);
router.post("/", verifyAdminToken, upload.single("logo"), createBrand);
router.put("/:id", verifyAdminToken, upload.single("logo"), updateBrand);
router.delete("/:id", verifyAdminToken, deleteBrand);
router.get("/:id", getBrandDetails);

export default router;
