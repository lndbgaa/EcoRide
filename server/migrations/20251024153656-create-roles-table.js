"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("roles", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    key: {
      type: Sequelize.ENUM("admin", "moderator", "user"),
      allowNull: false,
      unique: true,
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("roles");
}
