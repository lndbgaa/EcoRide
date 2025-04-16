CREATE DATABASE ecoride
CHARACTER SET utf8mb4 
COLLATE utf8mb4_0900_ai_ci;

USE ecoride;

-- TABLE ROLES
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(50) UNIQUE NOT NULL
);

-- TABLE ACCOUNTS
CREATE TABLE accounts (
  id CHAR(36) NOT NULL PRIMARY KEY,
  role_id INT NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  pseudo VARCHAR(50) NOT NULL,
  phone VARCHAR(50),
  address VARCHAR(255),
  birth_date DATE,
  profile_picture VARCHAR(255),
  is_driver BOOLEAN,
  is_passenger BOOLEAN,
  credits INT CHECK (credits >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  suspended_at TIMESTAMP,
  status ENUM('active', 'suspended', 'inactive', 'deleted') DEFAULT 'active',
  FOREIGN KEY (role_id) REFERENCES roles(id)
);



-- TABLE VEHICLE_BRANDS
CREATE TABLE vehicle_brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(50) UNIQUE NOT NULL
);

-- TABLE VEHICLE_COLORS
CREATE TABLE vehicle_colors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(50) UNIQUE NOT NULL
);

-- TABLE VEHICLE_ENERGIES
CREATE TABLE vehicle_energies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(50) UNIQUE NOT NULL
);

-- TABLE VEHICLES
CREATE TABLE vehicles (
  id CHAR(36) NOT NULL PRIMARY KEY,
  brand_id INT NOT NULL,
  model VARCHAR(50) NOT NULL,
  color_id INT NOT NULL,
  seats INT NOT NULL CHECK (seats BETWEEN 2 AND 7), -- !!!
  energy_id INT NOT NULL,
  license_plate VARCHAR(50) UNIQUE NOT NULL,
  first_registration DATE NOT NULL,
  owner_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id) REFERENCES vehicle_brands(id),
  FOREIGN KEY (color_id) REFERENCES vehicle_colors(id),
  FOREIGN KEY (energy_id) REFERENCES vehicle_energies(id),
  FOREIGN KEY (owner_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE INDEX idx_vehicles_owner ON vehicles(owner_id);

-- TABLE PREFERENCES
CREATE TABLE preferences (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  label VARCHAR(50) NOT NULL,
  value BOOLEAN,
  is_custom BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE CASCADE,
  UNIQUE (user_id, label)
);

CREATE INDEX idx_preferences_user ON preferences(user_id);

-- TABLE RIDES
CREATE TABLE rides (
  id CHAR(36) NOT NULL PRIMARY KEY,
  departure_date DATE NOT NULL,
  departure_location VARCHAR(255) NOT NULL,
  departure_time TIME NOT NULL,
  arrival_date DATE NOT NULL,
  arrival_location VARCHAR(255) NOT NULL,
  arrival_time TIME NOT NULL,
  driver_id CHAR(36) NULL, -- !!!
  vehicle_id CHAR(36) NULL, -- !!!
  is_eco_friendly BOOLEAN NOT NULL,
  price INT NOT NULL CHECK (price >= 1), -- !!!
  available_seats INT NOT NULL CHECK (available_seats >= 1),
  status ENUM('open', 'full', 'in_progress', 'completed', 'no_show', 'cancelled') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES accounts(id) ON DELETE SET NULL, -- !!!
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL -- !!!
);

CREATE INDEX idx_rides_driver ON rides(driver_id);

-- TABLE BOOKINGS
CREATE TABLE bookings (
  id CHAR(36) NOT NULL PRIMARY KEY,
  ride_id CHAR(36) NULL, -- !!!
  passenger_id CHAR(36) NULL, -- !!!
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('pending', 'confirmed','completed','cancelled') DEFAULT 'pending',
  FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL, -- !!!
  FOREIGN KEY (passenger_id) REFERENCES accounts(id) ON DELETE SET NULL, -- !!!
  UNIQUE (ride_id, passenger_id)
);

CREATE INDEX idx_bookings_ride ON bookings(ride_id);
CREATE INDEX idx_bookings_passenger ON bookings(passenger_id);

-- TABLE REVIEWS
CREATE TABLE reviews (
  id CHAR(36) NOT NULL PRIMARY KEY,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL, -- !!!
  author_id CHAR(36) NULL, -- !!!
  target_id CHAR(36) NULL, -- !!!
  ride_id CHAR(36) NULL, -- !!!
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  moderated_by CHAR(36) NULL, 
  FOREIGN KEY (author_id) REFERENCES accounts(id) ON DELETE SET NULL, -- !!!
  FOREIGN KEY (target_id) REFERENCES accounts(id) ON DELETE SET NULL, -- !!!
  FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL, -- !!!
  FOREIGN KEY (moderated_by) REFERENCES accounts(id) ON DELETE SET NULL,
  UNIQUE (ride_id, author_id, target_id)
);

CREATE INDEX idx_reviews_target ON reviews(target_id);
CREATE INDEX idx_reviews_author ON reviews(author_id);
CREATE INDEX idx_reviews_status ON reviews(status);
