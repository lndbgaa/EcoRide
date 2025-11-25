"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert("roles", [
    { id: 1, key: "admin" },
    { id: 2, key: "moderator" },
    { id: 3, key: "user" },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("roles", null, {});
}
