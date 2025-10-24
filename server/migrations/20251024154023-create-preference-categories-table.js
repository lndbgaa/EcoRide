"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("preference_categories", {
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
      type: Sequelize.STRING(100),
      allowNull: false,
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("preference_categories");
}
