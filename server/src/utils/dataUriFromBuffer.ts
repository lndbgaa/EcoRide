import DatauriParser from "datauri/parser.js";
import path from "path";

const parser = new DatauriParser();

const dataUriFromBuffer = (buffer: Buffer, fileName?: string): string => {
  const ext = (fileName && path.extname(fileName)) || ".bin";
  return parser.format(ext, buffer).content as string;
};

export { dataUriFromBuffer };
