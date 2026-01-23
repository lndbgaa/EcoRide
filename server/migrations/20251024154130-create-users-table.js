"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("users", {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "roles", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    email: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
    },
    username: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    first_name: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    last_name: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    phone: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    address: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    birth_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    profile_picture: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    average_rating: {
      type: Sequelize.DECIMAL(3, 1),
      allowNull: true,
    },
    credits: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: Sequelize.ENUM("active", "suspended", "pending_deletion", "deleted"),
      allowNull: false,
      defaultValue: "active",
    },
    email_is_verified: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    last_login: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    suspended_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    pending_deletion_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true,
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
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("users");
}
