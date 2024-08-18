"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Transactions", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			userId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			orderId: {
				type: Sequelize.INTEGER,
        		allowNull: false
			},
			createdByUserId: {
				type: Sequelize.INTEGER,
        		allowNull: false
			},
			status: {
				type: Sequelize.INTEGER,
        		allowNull: true
			},
			totalMoney: {
				type: Sequelize.DOUBLE,
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
		await queryInterface.dropTable("Transactions");
	},
};
