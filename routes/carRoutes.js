import express from "express";
import {
  getAllCars,
  getCars,
  getCarDetails,
  createCar,
  updateBasicInfo,
  updatePerformance,
  updateDimensions,
  updateFeatures,
  updateImages,
  deleteImage,
  deleteCar,
} from "../controllers/carController.js";
import { upload } from "../config/cloudinary.js";
import { verifyAdminToken } from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/", getAllCars);
router.get("/all", getCars);
router.get("/:id", getCarDetails);
router.post("/", verifyAdminToken, upload.array("images", 5), createCar);
router.put("/:id/basic-info", verifyAdminToken, updateBasicInfo);
router.put("/:id/performance", verifyAdminToken, updatePerformance);
router.put("/:id/dimensions", verifyAdminToken, updateDimensions);
router.put("/:id/features", verifyAdminToken, updateFeatures);
router.put(
  "/:id/images",
  verifyAdminToken,
  upload.array("images", 5),
  updateImages
);
router.delete("/:id/image", verifyAdminToken, deleteImage);
router.get("/:id", getCarDetails);
router.delete("/:id", verifyAdminToken, deleteCar);

export default router;
