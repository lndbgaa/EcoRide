"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("preference_options", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    category_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "preference_categories", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    key: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
    },
    display: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    icon: {
      type: Sequelize.STRING(100),
      allowNull: true, // FIXME mettre à false quand icones prêtes
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("preference_options");
}
