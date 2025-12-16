import ejs from "ejs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function renderTemplate(template: string, data: Record<string, unknown>): Promise<string> {
  const templatePath = path.join(__dirname, "..", "templates", template);
  return await ejs.renderFile(templatePath, data);
}

export default renderTemplate;
