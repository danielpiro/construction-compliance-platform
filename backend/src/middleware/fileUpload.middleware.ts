// src/middleware/fileUpload.middleware.ts
import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

interface MulterError extends Error {
  code: string;
  field?: string;
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, uploadsDir);
  },
  filename: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter - allow only images
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!") as any);
  }
};

// Create the multer upload middleware
export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
}).single("image"); // 'image' is the field name expected in the form

// Middleware to handle file upload errors
export const handleUploadError = (
  err: Error | MulterError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError || (err as MulterError).code) {
    // Multer error
    const multerErr = err as MulterError;
    if (multerErr.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  } else if (err) {
    // Other error
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};
