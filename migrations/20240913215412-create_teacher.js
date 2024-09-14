"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Teachers", {
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
			gender: {
				type: Sequelize.INTEGER,
        		allowNull: true
			},
      birthday: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			age: {
				type: Sequelize.INTEGER,
        		allowNull: true
			},
      address: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			phone: {
				type: Sequelize.STRING,
        		allowNull: true
			},
      email: {
				type: Sequelize.STRING,
				allowNull: true,
			},
      userId: {
				type: Sequelize.INTEGER,
        		allowNull: false
			},
      active: {
				type: Sequelize.BOOLEAN,
				allowNull: true,
			},
      level: {
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
		await queryInterface.dropTable("Teachers");
	},
};
