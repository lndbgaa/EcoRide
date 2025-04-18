import Admin from "./Admin.model.js";
import Booking from "./Booking.model.js";
import Employee from "./Employee.model.js";
import Review from "./Review.model.js";
import Ride from "./Ride.model.js";
import Role from "./Role.model.js";
import User from "./User.model.js";
import Vehicle from "./Vehicle.model.js";
import VehicleBrand from "./VehicleBrand.model.js";
import VehicleColor from "./VehicleColor.model.js";
import VehicleEnergy from "./VehicleEnergy.model.js";

// === Associations ===

// Rôles pour les différents types de comptes
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Admin.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Employee.belongsTo(Role, { foreignKey: "role_id", as: "role" });

// Véhicules liés à un utilisateur
Vehicle.belongsTo(User, { foreignKey: "owner_id", as: "owner" });
User.hasMany(Vehicle, { foreignKey: "owner_id", as: "vehicles" });

// Véhicule lié à ses attributs
Vehicle.belongsTo(VehicleBrand, { foreignKey: "brand_id", as: "brand" });
Vehicle.belongsTo(VehicleColor, { foreignKey: "color_id", as: "color" });
Vehicle.belongsTo(VehicleEnergy, { foreignKey: "energy_id", as: "energy" });

// Covoiturages lié à un utilisateur (chauffeur) et à un véhicule
Ride.belongsTo(User, { foreignKey: "driver_id", as: "driver" });
Ride.belongsTo(Vehicle, { foreignKey: "vehicle_id", as: "vehicle" });

// Avis liés à l'auteur, à la cible, à la modération et au trajet concerné
Review.belongsTo(User, { foreignKey: "author_id", as: "author" });
Review.belongsTo(User, { foreignKey: "target_id", as: "target" });
Review.belongsTo(Employee, { foreignKey: "moderator_id", as: "moderator" });
Review.belongsTo(Ride, { foreignKey: "ride_id", as: "ride" });

// Réservation lié à un passager et à un covoiturage
Booking.belongsTo(Ride, { foreignKey: "ride_id", as: "ride" });
Booking.belongsTo(User, { foreignKey: "passenger_id", as: "passenger" });

export { Admin, Booking, Employee, Review, Ride, Role, User, Vehicle };
