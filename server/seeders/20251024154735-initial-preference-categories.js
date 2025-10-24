"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert("preference_categories", [
    { id: 1, key: "chat", display: "Discussion" },
    { id: 2, key: "music", display: "Musique" },
    { id: 3, key: "smoking", display: "Cigarette" },
    { id: 4, key: "animals", display: "Animaux" },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("preference_categories", null, {});
}
