import adminRoutes from "./routes/adminRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import publicRoutes from "./routes/publicRoutes";
import userRoutes from "./routes/userRoutes";

const routes = [publicRoutes, userRoutes, adminRoutes, employeeRoutes];

export default routes;
