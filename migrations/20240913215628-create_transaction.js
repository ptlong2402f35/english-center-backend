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
      forUserId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
      createdByUserId: {
				type: Sequelize.INTEGER,
        allowNull: false
			},
      content: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
      totalMoney: {
				type: Sequelize.DOUBLE,
        		allowNull: true
			},
      costId: {
				type: Sequelize.INTEGER,
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
