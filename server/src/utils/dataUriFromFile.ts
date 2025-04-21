import DatauriParser from "datauri/parser";
import path from "path";

const dUri = new DatauriParser();

/**
 * Fonction utilitaire pour transformer le fichier uploadé en Data URI
 *
 * Cloudinary peut utiliser ce format pour uploader directement depuis un buffer mémoire
 */
const dataUriFromFile = (file: Express.Multer.File) => {
  const extName = path.extname(file.originalname).toString();
  return dUri.format(extName, file.buffer);
};

export default dataUriFromFile;
