"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("vehicle_energies", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    key: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("vehicle_energies");
}
