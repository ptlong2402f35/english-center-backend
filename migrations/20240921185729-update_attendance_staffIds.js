"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.removeColumn("Attendances", "studentId");
		await queryInterface.addColumn("Attendances", "studentIds", { type: Sequelize.ARRAY(Sequelize.INTEGER), defaultValue: [] });
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("Attendances", "studentIds");
	},
};
