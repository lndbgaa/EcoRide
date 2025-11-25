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
      type: Sequelize.ENUM("chat", "music", "smoking", "animals"),
      allowNull: false,
      unique: true,
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("preference_categories");
}
