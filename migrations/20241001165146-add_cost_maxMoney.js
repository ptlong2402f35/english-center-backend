"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("Costs", "originTotalMoney", { type: Sequelize.DOUBLE });
		await queryInterface.addColumn("Costs", "totalReduceMoney", { type: Sequelize.DOUBLE });
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("Costs", "originTotalMoney");
		await queryInterface.removeColumn("Costs", "totalReduceMoney");
	},
};
