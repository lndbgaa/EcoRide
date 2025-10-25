import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { LanguageDetector } from "i18next-http-middleware";
import path from "path";

i18next
  .use(Backend)
  .use(LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(process.cwd(), "src/i18n", "{{lng}}", "{{ns}}.json"),
    },
    detection: {
      order: ["querystring", "cookie"],
      caches: ["cookie"],
    },
    fallbackLng: "fr",
    preload: ["fr", "en"],
  });

export { i18next };
