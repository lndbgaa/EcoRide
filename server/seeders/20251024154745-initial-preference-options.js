"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert("preference_options", [
    { id: 1, category_id: 1, key: "chat_allowed" },
    { id: 2, category_id: 1, key: "chat_sometimes" },
    { id: 3, category_id: 1, key: "no_chat" },
    { id: 4, category_id: 2, key: "music_allowed" },
    { id: 5, category_id: 2, key: "music_sometimes" },
    { id: 6, category_id: 2, key: "no_music" },
    { id: 7, category_id: 3, key: "smoking_allowed" },
    { id: 8, category_id: 3, key: "smoking_sometimes" },
    { id: 9, category_id: 3, key: "no_smoking" },
    { id: 10, category_id: 4, key: "animals_allowed" },
    { id: 11, category_id: 4, key: "animals_sometimes" },
    { id: 12, category_id: 4, key: "no_animals" },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("preference_options", null, {});
}
