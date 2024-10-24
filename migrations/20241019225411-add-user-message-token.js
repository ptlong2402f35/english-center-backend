"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("Users", "messageToken", { type: Sequelize.TEXT });
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("Users", "messageToken");
	},
};
