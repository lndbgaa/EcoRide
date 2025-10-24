"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert("preference_options", [
    {
      id: 1,
      category_id: 1,
      key: "chat_allowed",
      display: "Je parle facilement… parfois même avec le GPS !",
    },
    {
      id: 2,
      category_id: 1,
      key: "chat_sometimes",
      display: "J'aime discuter quand je me sens à l'aise",
    },
    { id: 3, category_id: 1, key: "no_chat", display: "Je ne suis pas très bavard(e)" },

    { id: 4, category_id: 2, key: "music_allowed", display: "La musique fait partie du voyage !" },
    {
      id: 5,
      category_id: 2,
      key: "music_sometimes",
      display: "Musique possible, selon l'ambiance",
    },
    { id: 6, category_id: 2, key: "no_music", display: "Je préfère voyager dans le calme" },

    {
      id: 7,
      category_id: 3,
      key: "smoking_allowed",
      display: "Cigarettes autorisées dans la voiture",
    },
    {
      id: 8,
      category_id: 3,
      key: "smoking_sometimes",
      display: "Les pauses cigarette ne me dérangent pas",
    },
    { id: 9, category_id: 3, key: "no_smoking", display: "Pas de cigarette du tout" },

    { id: 10, category_id: 4, key: "animals_allowed", display: "Les animaux sont les bienvenus !" },
    {
      id: 11,
      category_id: 4,
      key: "animals_sometimes",
      display: "Je peux voyager avec certains animaux",
    },
    { id: 12, category_id: 4, key: "no_animals", display: "Je préfère voyager sans animaux" },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("preference_options", null, {});
}
