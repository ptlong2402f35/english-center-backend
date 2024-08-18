'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn("Orders", "onepayPaymentId", {
			type: Sequelize.TEXT,
		});
    await queryInterface.addColumn("Transactions", "paypalPaymentId", {
			type: Sequelize.TEXT,
		});
    await queryInterface.addColumn("Transactions", "onepayPaymentId", {
			type: Sequelize.TEXT,
		});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
		await queryInterface.removeColumn("Transactions", "paypalPaymentId");
		await queryInterface.removeColumn("Transactions", "onepayPaymentId");
  }
};
