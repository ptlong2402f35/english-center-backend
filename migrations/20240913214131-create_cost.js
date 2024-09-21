"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Costs", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			referenceId: {
				type: Sequelize.INTEGER,
        		allowNull: true
			},
			type: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			status: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			totalMoney: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
			forMonth: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			otherType: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			forUserId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			debtMoney: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
			paidMoney: {
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
		await queryInterface.dropTable("Costs");
	},
};
