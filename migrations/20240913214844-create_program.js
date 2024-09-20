"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Programs", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			reducePercent: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
			reduceValue: {
				type: Sequelize.DOUBLE,
        		allowNull: true
			},
      startAt: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			endAt: {
				type: Sequelize.DATE,
        		allowNull: true
			},
      status: {
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
		await queryInterface.dropTable("Programs");
	},
};
