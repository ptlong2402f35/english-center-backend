"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Users", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			userName: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			password: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			role: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			active: {
				type: Sequelize.BOOLEAN,
				allowNull: true,
			},
      		resetKey: {
				type: Sequelize.TEXT,
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
		await queryInterface.dropTable("Users");
	},
};
