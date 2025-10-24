"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert("roles", [
    { id: 1, key: "admin", display: "Administrateur" },
    { id: 2, key: "moderator", display: "Modérateur" },
    { id: 3, key: "user", display: "Utilisateur" },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("roles", null, {});
}
