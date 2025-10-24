"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("bookings", {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    ride_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "rides", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    passenger_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    seats_booked: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("confirmed", "awaiting_feedback", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "confirmed",
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
  await queryInterface.dropTable("bookings");
}
