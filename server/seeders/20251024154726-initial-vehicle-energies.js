"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert("vehicle_energies", [
    { id: 1, key: "petrol", display: "Essence" },
    { id: 2, key: "diesel", display: "Diesel" },
    { id: 3, key: "electric", display: "Électrique" },
    { id: 4, key: "hybrid_petrol", display: "Hybride Essence" },
    { id: 5, key: "hybrid_diesel", display: "Hybride Diesel" },
    { id: 6, key: "plug_in_hybrid", display: "Hybride rechargeable" },
    { id: 7, key: "lpg", display: "GPL" },
    { id: 8, key: "cng", display: "GNV" },
    { id: 9, key: "bioethanol", display: "Bioéthanol" },
    { id: 10, key: "hydrogen", display: "Hydrogène" },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("vehicle_energies", null, {});
}
