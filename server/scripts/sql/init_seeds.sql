
-- Rôles
INSERT INTO roles (label) VALUES 
('admin'),
('employee'), 
('user')
ON DUPLICATE KEY UPDATE label = VALUES(label);

-- Marques
INSERT INTO vehicle_brands (label) VALUES 
('Renault'),
('Peugeot'),
('Citroën'),
('Ford'),
('Tesla'),
('Toyota'),
('Volkswagen'),
('BMW'),
('Mercedes'), 
('Audi'),
('Nissan'),
('Hyundai'),
('Kia'),
('Dacia'),
('Fiat'),
('Mazda'),
('Honda'),
('Chevrolet'),
('Jeep'),
('Opel'),
('Skoda'),
('Suzuki'),
('Volvo'),
('Lexus'), 
('Alfa Romeo'),
('Mini'),
('Mitsubishi'),
('Land Rover'),
('Jaguar')
ON DUPLICATE KEY UPDATE label = VALUES(label);
-- Couleurs
INSERT INTO vehicle_colors (label) VALUES 
('Noir'),
('Blanc'),
('Gris'),
('Rouge'),
('Bleu'),
('Vert'),
('Jaune'), 
('Marron'),
('Orange'), 
('Violet'), 
('Rose')
ON DUPLICATE KEY UPDATE label = VALUES(label);

-- Énergies
INSERT INTO vehicle_energies (label) VALUES 
('Essence'),
('Diesel'),
('Électrique'),
('Hybride essence'),
('Hybride diesel'),
('GPL'),
('GNV'),
('Bioéthanol'),
('Hydrogène')
ON DUPLICATE KEY UPDATE label = VALUES(label);