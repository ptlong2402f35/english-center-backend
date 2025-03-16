"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("Students", "en_name", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Students", "en_gender", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Students", "en_birthday", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Students", "en_age", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Students", "en_address", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Students", "en_phone", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Students", "en_email", { type: Sequelize.TEXT });
    await queryInterface.addColumn("Parents", "en_name", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Parents", "en_gender", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Parents", "en_birthday", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Parents", "en_age", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Parents", "en_address", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Parents", "en_phone", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Parents", "en_email", { type: Sequelize.TEXT });
    await queryInterface.addColumn("Teachers", "en_name", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Teachers", "en_gender", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Teachers", "en_birthday", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Teachers", "en_age", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Teachers", "en_address", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Teachers", "en_phone", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Teachers", "en_email", { type: Sequelize.TEXT });
    await queryInterface.addColumn("Users", "en_userName", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Users", "en_role", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Users", "en_email", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Costs", "en_referenceId", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Costs", "en_type", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Costs", "en_status", { type: Sequelize.TEXT });
		await queryInterface.addColumn("Costs", "en_totalMoney", { type: Sequelize.TEXT });
    await queryInterface.addColumn("Costs", "en_originTotalMoney", { type: Sequelize.TEXT });
    await queryInterface.addColumn("Costs", "en_otherType", { type: Sequelize.TEXT });
    await queryInterface.addColumn("Costs", "en_paidMoney", { type: Sequelize.TEXT });
    await queryInterface.addColumn("Costs", "en_debtMoney", { type: Sequelize.TEXT });
    await queryInterface.addColumn("Costs", "en_totalReduceMoney", { type: Sequelize.TEXT });
    await queryInterface.addColumn("Transactions", "en_content", { type: Sequelize.TEXT });
    await queryInterface.addColumn("Transactions", "en_totalMoney", { type: Sequelize.TEXT });
  },

	async down(queryInterface, Sequelize) {
		// await queryInterface.removeColumn("Students", "messageToken");
	},
};
