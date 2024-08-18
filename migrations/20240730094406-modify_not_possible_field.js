"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.changeColumn("Orders", "paypalPaymentId", { type: Sequelize.TEXT });
    await queryInterface.removeColumn("Orders", "transactionId");
    
    await queryInterface.removeColumn("Users", "partnerId");

    await queryInterface.addColumn("Transactions", "createdByUserId", {type: Sequelize.INTEGER});
    await queryInterface.addColumn("Transactions", "content", {type: Sequelize.TEXT});

	},

	async down(queryInterface, Sequelize) {
		//empty
	},
};
