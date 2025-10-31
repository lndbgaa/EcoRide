import multer from "multer";

const storage = multer.memoryStorage();

const imageUpload = multer({ storage }).single("image");

export { imageUpload };
