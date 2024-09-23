"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Reviews", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			generalContent: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
      specificContent: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			sessionContent: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			type: {
				type: Sequelize.INTEGER,
        allowNull: true
			},
      referenceId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			title: {
				type: Sequelize.TEXT,
        		allowNull: true
			},
      attendanceId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			classId: {
				type: Sequelize.INTEGER,
        allowNull: true
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
		await queryInterface.dropTable("Reviews");
	},
};
