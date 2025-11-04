"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("rides", {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    departure_datetime: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    departure_location: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    arrival_datetime: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    arrival_location: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    driver_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    vehicle_id: {
      type: Sequelize.UUID,
      allowNull: null,
      references: { model: "vehicles", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    price: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    offered_seats: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    available_seats: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: Sequelize.ENUM("open", "full", "in_progress", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "open",
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
  await queryInterface.dropTable("rides");
}
