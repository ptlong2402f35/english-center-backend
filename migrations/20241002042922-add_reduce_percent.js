"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("StudentClasses", "reducePercent", { type: Sequelize.DOUBLE });
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("StudentClasses", "reducePercent");
	},
};
