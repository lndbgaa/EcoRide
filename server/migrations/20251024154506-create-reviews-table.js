"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("reviews", {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    rating: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    comment: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    author_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    target_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    ride_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "rides", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    status: {
      type: Sequelize.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    moderator_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },
  });

  await queryInterface.addIndex("reviews", ["author_id", "target_id", "ride_id"], {
    unique: true,
    name: "unique_review_per_ride_author_target",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("reviews");
}
