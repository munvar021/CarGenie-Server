import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.match(/(jpg|jpeg|png|webp)$/)) {
    return cb(
      new Error("Only JPG, JPEG, PNG, and WEBP files are allowed"),
      false
    );
  }
  cb(null, true);
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "cargenie",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1000, height: 700, fit: "scale" }],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter,
});

export { cloudinary, upload };
