"use strict";

const { OrderRefundStatus, OrderStatus } = require("../constants/status");

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Centers", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			name: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			address: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			phone: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			status: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			images: {
				type: Sequelize.JSON,
				allowNull: true,
			},
			createdAt: {
				type: Sequelize.DATE,
        		defaultValue: new Date(), 
				allowNull: false,
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
        		defaultValue: new Date()
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("Centers");
	},
};
