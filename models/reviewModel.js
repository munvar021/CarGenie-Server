import mongoose from "mongoose";
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    carModel: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: false }
);

reviewSchema.virtual("userAvatar").get(function () {
  if (this.populated("userId")) {
    return this.userId.profileImage;
  }
  return null;
});

reviewSchema.virtual("userName").get(function () {
  if (this.populated("userId")) {
    return this.userId.fullName;
  }
  return null;
});

reviewSchema.set("toJSON", { virtuals: true });
reviewSchema.set("toObject", { virtuals: true });

export default mongoose.model("Review", reviewSchema);
