"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert("vehicle_energies", [
    { id: 1, key: "petrol" },
    { id: 2, key: "diesel" },
    { id: 3, key: "electric" },
    { id: 4, key: "hybrid_petrol" },
    { id: 5, key: "hybrid_diesel" },
    { id: 6, key: "plug_in_hybrid" },
    { id: 7, key: "lpg" },
    { id: 8, key: "cng" },
    { id: 9, key: "bioethanol" },
    { id: 10, key: "hydrogen" },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("vehicle_energies", null, {});
}
