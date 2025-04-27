import express from "express";
import {
  getAllReviews,
  getUserReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllReviews);
router.get("/user/:userId", getUserReviews);
router.get("/my-reviews", authenticateToken, getUserReviews);
router.post("/", authenticateToken, createReview);
router.put("/:reviewId", authenticateToken, updateReview);
router.delete("/:reviewId", authenticateToken, deleteReview);

export default router;
