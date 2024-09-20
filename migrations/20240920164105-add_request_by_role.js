"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.removeColumn("Requests", "requestByUserId");
		await queryInterface.addColumn("Requests", "requestByRoleId", { type: Sequelize.INTEGER, allowNull: true });
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("Requests", "requestByRoleId");
	},
};
