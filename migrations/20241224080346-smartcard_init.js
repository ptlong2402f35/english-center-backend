"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("SmartCardUsers", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			cardId: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			name: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			phone: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			publicKey: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
      image: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
      point: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: new Date(),
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: new Date(),
			}

		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("SmartCardUsers");
	},
};
