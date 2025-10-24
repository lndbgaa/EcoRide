"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert("vehicle_colors", [
    { id: 1, key: "black", display: "Noir" },
    { id: 2, key: "white", display: "Blanc" },
    { id: 3, key: "dark_gray", display: "Gris foncé" },
    { id: 4, key: "gray", display: "Gris" },
    { id: 5, key: "burgundy", display: "Bordeaux" },
    { id: 6, key: "red", display: "Rouge" },
    { id: 7, key: "dark_blue", display: "Bleu foncé" },
    { id: 8, key: "blue", display: "Bleu" },
    { id: 9, key: "dark_green", display: "Vert foncé" },
    { id: 10, key: "green", display: "Vert" },
    { id: 11, key: "brown", display: "Marron" },
    { id: 12, key: "beige", display: "Beige" },
    { id: 13, key: "orange", display: "Orange" },
    { id: 14, key: "yellow", display: "Jaune" },
    { id: 15, key: "purple", display: "Violet" },
    { id: 16, key: "pink", display: "Rose" },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("vehicle_colors", null, {});
}
