import Review from "../models/reviewModel.js";

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate({
        path: "userId",
        select: "fullName profileImage",
      })
      .sort({ createdAt: -1 });

    const formattedReviews = reviews.map((review) => ({
      id: review._id,
      userId: review.userId._id,
      userName: review.userId.fullName,
      userAvatar: review.userId.profileImage,
      carModel: review.carModel,
      content: review.content,
      rating: review.rating,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      data: formattedReviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;

    const reviews = await Review.find({ userId })
      .populate({
        path: "userId",
        select: "fullName profileImage",
      })
      .sort({ createdAt: -1 });

    const formattedReviews = reviews.map((review) => ({
      id: review._id,
      userId: review.userId._id,
      userName: review.userId.fullName,
      userAvatar: review.userId.profileImage,
      carModel: review.carModel,
      content: review.content,
      rating: review.rating,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      data: formattedReviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user reviews",
      error: error.message,
    });
  }
};

export const createReview = async (req, res) => {
  try {
    const { carModel, content, rating } = req.body;
    const userId = req.user.userId;

    if (!carModel || !content || !rating) {
      return res.status(400).json({
        success: false,
        message: "Please provide carModel, content, and rating",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const newReview = new Review({
      userId,
      carModel,
      content,
      rating,
      createdAt: new Date(),
    });

    await newReview.save();

    await newReview.populate({
      path: "userId",
      select: "fullName profileImage",
    });

    const formattedReview = {
      id: newReview._id,
      userId: newReview.userId._id,
      userName: newReview.userId.fullName,
      userAvatar: newReview.userId.profileImage,
      carModel: newReview.carModel,
      content: newReview.content,
      rating: newReview.rating,
      createdAt: newReview.createdAt,
      updatedAt: newReview.updatedAt,
    };

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: formattedReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: error.message,
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { carModel, content, rating } = req.body;
    const userId = req.user.userId;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this review",
      });
    }

    if (carModel) review.carModel = carModel;
    if (content) review.content = content;
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }
      review.rating = rating;
    }

    review.updatedAt = new Date();

    await review.save();

    await review.populate({
      path: "userId",
      select: "fullName profileImage",
    });

    const formattedReview = {
      id: review._id,
      userId: review.userId._id,
      userName: review.userId.fullName,
      userAvatar: review.userId.profileImage,
      carModel: review.carModel,
      content: review.content,
      rating: review.rating,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: formattedReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: error.message,
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this review",
      });
    }

    await Review.findByIdAndDelete(reviewId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};
