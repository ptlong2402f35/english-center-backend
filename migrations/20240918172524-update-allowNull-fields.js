"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.removeColumn("Costs", "otherType");
		await queryInterface.removeColumn("Notifications", "type");
		await queryInterface.removeColumn("Notifications", "title");
		await queryInterface.removeColumn("Notifications", "seenAt");
		await queryInterface.removeColumn("Programs", "reduceValue");
		await queryInterface.removeColumn("Programs", "endAt");
		await queryInterface.addColumn("Costs", "otherType", { type: Sequelize.INTEGER, allowNull: true });
		await queryInterface.addColumn("Notifications", "type", { type: Sequelize.INTEGER, allowNull: true });
		await queryInterface.addColumn("Notifications", "title", { type: Sequelize.TEXT, allowNull: true });
		await queryInterface.addColumn("Notifications", "seenAt", { type: Sequelize.TEXT, allowNull: true });
		await queryInterface.addColumn("Programs", "reduceValue", { type: Sequelize.DOUBLE, allowNull: true });
		await queryInterface.addColumn("Programs", "endAt", { type: Sequelize.DATE, allowNull: true });
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("Costs", "otherType");
		await queryInterface.removeColumn("Notifications", "type");
		await queryInterface.removeColumn("Notifications", "title");
		await queryInterface.removeColumn("Notifications", "seenAt");
		await queryInterface.removeColumn("Programs", "reduceValue");
		await queryInterface.removeColumn("Programs", "endAt");
	},
};
