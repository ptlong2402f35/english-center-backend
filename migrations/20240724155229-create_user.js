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
			fullName: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			phone: {
				allowNull: true,
				type: Sequelize.STRING,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			password: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			role: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			avatar: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			address: {
				type: Sequelize.STRING,
				allowNull: true,
			},
      		gender: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			partnerId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			communicationId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			lat: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
      		long: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
      		coordinate: {
				type: Sequelize.DataTypes.GEOMETRY("POINT"),
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
