"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Forms", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			email: {
				type: Sequelize.STRING,
        		allowNull: true
			},
			partnerInfo: {
				type: Sequelize.JSON,
				allowNull: true,
			},
      		contractInfo: {
				type: Sequelize.JSON,
				allowNull: true,
			},
      		extenalInfo: {
				type: Sequelize.JSON,
				allowNull: true,
			},
			status: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			type: {
				type: Sequelize.INTEGER,
				allowNull: false,
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
		await queryInterface.dropTable("Forms");
	},
};
