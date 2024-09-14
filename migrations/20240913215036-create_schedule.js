"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Schedules", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			date: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			startAt: {
				type: Sequelize.STRING,
        		allowNull: false
			},
      endAt: {
				type: Sequelize.STRING,
        		allowNull: false
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
		await queryInterface.dropTable("Schedules");
	},
};
