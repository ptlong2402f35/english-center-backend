"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("TeacherClasses", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
      teacherId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
      classId: {
				type: Sequelize.INTEGER,
        		allowNull: false
			},
      salary: {
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
		await queryInterface.dropTable("TeacherClasses");
	},
};
