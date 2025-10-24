"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("vehicles", {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    brand_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "vehicle_brands", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    model: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    color_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "vehicle_colors", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    energy_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "vehicle_energies", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    seats: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    license_plate: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
    },
    registration_date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    owner_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    status: {
      type: Sequelize.ENUM("active", "archived"),
      allowNull: false,
      defaultValue: "active",
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("vehicles");
}
