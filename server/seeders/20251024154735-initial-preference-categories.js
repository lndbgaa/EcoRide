"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert("preference_categories", [
    { id: 1, key: "chat" },
    { id: 2, key: "music" },
    { id: 3, key: "smoking" },
    { id: 4, key: "animals" },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("preference_categories", null, {});
}
