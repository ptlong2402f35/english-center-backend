"use strict";
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Partners", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			active: {
				type: Sequelize.BOOLEAN,
			},
			userId: {
				type: Sequelize.INTEGER,
			},
			address: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			lat: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
			long: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
			fee: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
      		workTime: {
				type: Sequelize.JSON,
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
		await queryInterface.dropTable("Partners");
	},
};
