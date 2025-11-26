"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("preferences", {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    option_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "preference_options", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    category_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: "Derived from preference_options.category_id for indexing",
    },
  });

  await queryInterface.addIndex("preferences", ["user_id", "category_id"], {
    unique: true,
    name: "unique_user_category",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("preferences");
}
