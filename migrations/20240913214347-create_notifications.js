"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Notifications", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			content: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			type: {
				type: Sequelize.INTEGER,
        		allowNull: false
			},
      toUserId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			title: {
				type: Sequelize.TEXT,
        		allowNull: false
			},
      seen: {
				type: Sequelize.BOOLEAN,
				allowNull: true,
			},
			seenAt: {
				type: Sequelize.DATE,
        		allowNull: false
			},
      actionType: {
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
		await queryInterface.dropTable("Notifications");
	},
};
