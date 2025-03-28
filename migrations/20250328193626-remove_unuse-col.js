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
		await queryInterface.removeColumn("Parents", "gender");
		await queryInterface.removeColumn("Parents", "birthday");
		await queryInterface.removeColumn("Parents", "age");
		await queryInterface.removeColumn("Parents", "address");
		await queryInterface.removeColumn("Parents", "phone");
		await queryInterface.removeColumn("Parents", "email");
		await queryInterface.removeColumn("Students", "gender");
		await queryInterface.removeColumn("Students", "birthday");
		await queryInterface.removeColumn("Students", "age");
		await queryInterface.removeColumn("Students", "address");
		await queryInterface.removeColumn("Students", "phone");
		await queryInterface.removeColumn("Students", "email");
    await queryInterface.removeColumn("Teachers", "gender");
		await queryInterface.removeColumn("Teachers", "birthday");
		await queryInterface.removeColumn("Teachers", "age");
		await queryInterface.removeColumn("Teachers", "address");
		await queryInterface.removeColumn("Teachers", "phone");
		await queryInterface.removeColumn("Teachers", "email");

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
