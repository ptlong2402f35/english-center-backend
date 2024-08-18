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
    await queryInterface.addColumn("Partners", "rateReview", {
			type: Sequelize.INTEGER,
      defaultValue: 5
		});
    await queryInterface.addColumn("Partners", "reviewCount", {
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
		await queryInterface.removeColumn("Partners", "rateReview");
		await queryInterface.removeColumn("Partners", "reviewCount");
  }
};
