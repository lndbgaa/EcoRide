"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert("vehicle_colors", [
    { id: 1, key: "black" },
    { id: 2, key: "white" },
    { id: 3, key: "dark_gray" },
    { id: 4, key: "gray" },
    { id: 5, key: "burgundy" },
    { id: 6, key: "red" },
    { id: 7, key: "dark_blue" },
    { id: 8, key: "blue" },
    { id: 9, key: "dark_green" },
    { id: 10, key: "green" },
    { id: 11, key: "brown" },
    { id: 12, key: "beige" },
    { id: 13, key: "orange" },
    { id: 14, key: "yellow" },
    { id: 15, key: "purple" },
    { id: 16, key: "pink" },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("vehicle_colors", null, {});
}
