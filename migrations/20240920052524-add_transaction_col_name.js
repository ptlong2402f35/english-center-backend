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
    await queryInterface.addColumn("Costs", "name", {
			type: Sequelize.TEXT,
		});
    await queryInterface.addColumn("Costs", "paidAt", {
			type: Sequelize.DATE,
		});
    await queryInterface.addColumn("Transactions", "costType", {
			type: Sequelize.INTEGER,
		});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
		await queryInterface.removeColumn("Costs", "name");
		await queryInterface.removeColumn("Costs", "paidAt");
		await queryInterface.removeColumn("Transactions", "costType");
}
};
