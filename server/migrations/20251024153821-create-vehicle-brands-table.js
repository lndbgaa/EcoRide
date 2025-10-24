"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("vehicle_brands", {
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
    display: {
      type: Sequelize.STRING(1000),
      allowNull: false,
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("vehicle_brands");
}
