import { sequelize } from "@/config";

import Booking from "./Booking.model.js";
import EmailVerificationToken from "./EmailVerificationToken.model.js";
import PasswordResetToken from "./PasswordResetToken.model.js";
import Preference from "./Preference.model.js";
import PreferenceCategory from "./PreferenceCategory.model.js";
import PreferenceOption from "./PreferenceOption.model.js";
import RefreshToken from "./RefreshToken.model.js";
import Review from "./Review.model.js";
import Role from "./Role.model.js";
import Trip from "./Trip.model.js";
import User from "./User.model.js";
import Vehicle from "./Vehicle.model.js";
import VehicleBrand from "./VehicleBrand.model.js";
import VehicleColor from "./VehicleColor.model.js";
import VehicleEnergy from "./VehicleEnergy.model.js";

Role.initModel(sequelize);
User.initModel(sequelize);
EmailVerificationToken.initModel(sequelize);
RefreshToken.initModel(sequelize);
PasswordResetToken.initModel(sequelize);
Vehicle.initModel(sequelize);
VehicleBrand.initModel(sequelize);
VehicleColor.initModel(sequelize);
VehicleEnergy.initModel(sequelize);
Preference.initModel(sequelize);
PreferenceCategory.initModel(sequelize);
PreferenceOption.initModel(sequelize);
Trip.initModel(sequelize);
Booking.initModel(sequelize);
Review.initModel(sequelize);

// ----------------------------
// Roles
// ----------------------------

Role.hasMany(User, { foreignKey: "role_id", as: "users" });
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });

// ----------------------------
// Email Verification Tokens
// ----------------------------

User.hasMany(EmailVerificationToken, { foreignKey: "user_id", as: "emailVerificationTokens" });
EmailVerificationToken.belongsTo(User, { foreignKey: "user_id", as: "user" });

// ----------------------------
// Refresh Tokens
// ----------------------------

User.hasMany(RefreshToken, { foreignKey: "user_id", as: "refreshTokens" });
RefreshToken.belongsTo(User, { foreignKey: "user_id", as: "user" });

// ----------------------------
// Password Reset Tokens
// ----------------------------

User.hasMany(PasswordResetToken, { foreignKey: "user_id", as: "passwordResetTokens" });
PasswordResetToken.belongsTo(User, { foreignKey: "user_id", as: "user" });

// ----------------------------
// Vehicles
// ----------------------------

User.hasMany(Vehicle, { foreignKey: "owner_id", as: "vehicles" });
Vehicle.belongsTo(User, { foreignKey: "owner_id", as: "owner" });

Vehicle.belongsTo(VehicleBrand, { foreignKey: "brand_id", as: "brand" });
VehicleBrand.hasMany(Vehicle, { foreignKey: "brand_id", as: "vehicles" });

Vehicle.belongsTo(VehicleColor, { foreignKey: "color_id", as: "color" });
VehicleColor.hasMany(Vehicle, { foreignKey: "color_id", as: "vehicles" });

Vehicle.belongsTo(VehicleEnergy, { foreignKey: "energy_id", as: "energy" });
VehicleEnergy.hasMany(Vehicle, { foreignKey: "energy_id", as: "vehicles" });

// ----------------------------
// Preferences
// ----------------------------

User.hasMany(Preference, { foreignKey: "user_id", as: "preferences" });
Preference.belongsTo(User, { foreignKey: "user_id", as: "user" });

PreferenceOption.hasMany(Preference, { foreignKey: "option_id", as: "preferences" });
Preference.belongsTo(PreferenceOption, { foreignKey: "option_id", as: "option" });

PreferenceCategory.hasMany(PreferenceOption, { foreignKey: "category_id", as: "options" });
PreferenceOption.belongsTo(PreferenceCategory, { foreignKey: "category_id", as: "category" });

// ----------------------------
// Trips
// ----------------------------

User.hasMany(Trip, { foreignKey: "driver_id", as: "trips" });
Trip.belongsTo(User, { foreignKey: "driver_id", as: "driver" });

Vehicle.hasMany(Trip, { foreignKey: "vehicle_id", as: "trips" });
Trip.belongsTo(Vehicle, { foreignKey: "vehicle_id", as: "vehicle" });

// ----------------------------
// Bookings
// ----------------------------

Trip.hasMany(Booking, { foreignKey: "trip_id", as: "bookings" });
Booking.belongsTo(Trip, { foreignKey: "trip_id", as: "trip" });

User.hasMany(Booking, { foreignKey: "passenger_id", as: "bookings" });
Booking.belongsTo(User, { foreignKey: "passenger_id", as: "passenger" });

// ----------------------------
// Reviews
// ----------------------------

Review.belongsTo(User, { foreignKey: "author_id", as: "author" });
Review.belongsTo(User, { foreignKey: "target_id", as: "target" });
Review.belongsTo(User, { foreignKey: "moderator_id", as: "moderator" });

User.hasMany(Review, { foreignKey: "author_id", as: "reviewsAuthored" });
User.hasMany(Review, { foreignKey: "target_id", as: "reviewsReceived" });
User.hasMany(Review, { foreignKey: "moderator_id", as: "reviewsModerated" });

Trip.hasMany(Review, { foreignKey: "trip_id", as: "reviews" });
Review.belongsTo(Trip, { foreignKey: "trip_id", as: "trip" });

// ----------------------------
// Export all models
// ----------------------------

export {
  Booking,
  EmailVerificationToken,
  PasswordResetToken,
  Preference,
  PreferenceCategory,
  PreferenceOption,
  RefreshToken,
  Review,
  Role,
  Trip,
  User,
  Vehicle,
  VehicleBrand,
  VehicleColor,
  VehicleEnergy
};
