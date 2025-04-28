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
  role_id INT NOT NULL ,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  pseudo VARCHAR(50) UNIQUE NOT NULL,
  phone VARCHAR(50),
  address VARCHAR(255),
  birth_date DATE,
  profile_picture VARCHAR(255),
  is_driver BOOLEAN,
  is_passenger BOOLEAN,
  average_rating DECIMAL(3,2),
  credits INT CHECK (credits >= 0),
  status ENUM('active', 'suspended') DEFAULT 'active',
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  suspended_at TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX idx_role_id ON accounts(role_id);

-- TABLE REFRESH_TOKENS
CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id CHAR(36) NOT NULL,
  token VARCHAR(21) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
); 

CREATE INDEX idx_account_id ON refresh_tokens(account_id);

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
  energy_id INT NOT NULL,
  seats INT NOT NULL CHECK (seats BETWEEN 2 AND 7), -- véhicules de 2 à 7 places max = voiture
  license_plate VARCHAR(50) UNIQUE NOT NULL,
  first_registration DATE NOT NULL,
  owner_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id) REFERENCES vehicle_brands(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (color_id) REFERENCES vehicle_colors(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (energy_id) REFERENCES vehicle_energies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (owner_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE INDEX idx_owner_id ON vehicles(owner_id);

-- TABLE PREFERENCES
CREATE TABLE preferences (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  label VARCHAR(50) NOT NULL,
  value BOOLEAN DEFAULT TRUE,
  is_custom BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE CASCADE,
  UNIQUE (user_id, label)
); 

CREATE INDEX idx_user_id ON preferences(user_id);

-- TABLE RIDES
CREATE TABLE rides (
  id CHAR(36) NOT NULL PRIMARY KEY,  
  departure_datetime DATETIME NOT NULL,
  departure_location VARCHAR(255) NOT NULL,
  arrival_datetime DATETIME NOT NULL,
  arrival_location VARCHAR(255) NOT NULL,
  duration INT NOT NULL,
  driver_id CHAR(36) NOT NULL,
  vehicle_id CHAR(36) NOT NULL,
  price INT NOT NULL CHECK (price BETWEEN 10 AND 500), -- crédits (1 crédit = 0,10€)
  offered_seats INT NOT NULL CHECK (offered_seats BETWEEN 1 AND 6 ), 
  available_seats INT NOT NULL CHECK (available_seats >= 0),
  is_eco_friendly BOOLEAN NOT NULL,
  status ENUM('open', 'full', 'in_progress', 'completed', 'cancelled') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES accounts(id) ON DELETE RESTRICT, 
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_driver_id ON rides(driver_id);
CREATE INDEX idx_departure_datetime ON rides(status, departure_datetime);

-- TABLE BOOKINGS
CREATE TABLE bookings (
  id CHAR(36) NOT NULL PRIMARY KEY,
  ride_id CHAR(36) NOT NULL,
  passenger_id CHAR(36) NOT NULL,
  seats_booked INT NOT NULL CHECK (seats_booked BETWEEN 1 AND 6),
  status ENUM('confirmed', 'completed', 'cancelled') DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE RESTRICT, 
  FOREIGN KEY (passenger_id) REFERENCES accounts(id) ON DELETE RESTRICT
);

CREATE INDEX idx_passenger_id ON bookings(passenger_id);
CREATE INDEX idx_ride_id ON bookings(ride_id);
CREATE INDEX idx_status ON bookings(status);

-- TABLE REVIEWS
CREATE TABLE reviews (
  id CHAR(36) NOT NULL PRIMARY KEY,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  author_id CHAR(36) NULL, 
  target_id CHAR(36) NULL,
  ride_id CHAR(36) NULL, 
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  moderator_id CHAR(36) NULL, 
  FOREIGN KEY (author_id) REFERENCES accounts(id) ON DELETE SET NULL, 
  FOREIGN KEY (target_id) REFERENCES accounts(id) ON DELETE SET NULL, 
  FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL, 
  FOREIGN KEY (moderator_id) REFERENCES accounts(id) ON DELETE SET NULL,
  UNIQUE (ride_id, author_id, target_id)
);

CREATE INDEX idx_author_id ON reviews(author_id);
CREATE INDEX idx_target_id ON reviews(target_id);
