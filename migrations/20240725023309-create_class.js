"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Classes", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			name: {
				type: Sequelize.STRING,
        		allowNull: true
			},
			fromAge: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			toAge: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			startAt: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			endAt: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			studentQuantity: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			maxQuantity: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			fee: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
			totalSession: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			teachedSession: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			status: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			programId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			centerId: {
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
		await queryInterface.dropTable("Classes");
	},
};
