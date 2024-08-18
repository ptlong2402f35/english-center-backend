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
    await queryInterface.addColumn("Partners", "displayName", {
			type: Sequelize.STRING,
		});
    await queryInterface.addColumn("Partners", "displayAddress", {
			type: Sequelize.STRING,
		});
    await queryInterface.addColumn("Partners", "type", {
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
		await queryInterface.removeColumn("Partners", "displayName");
		await queryInterface.removeColumn("Partners", "displayAddress");
		await queryInterface.removeColumn("Partners", "type");
  }
};
