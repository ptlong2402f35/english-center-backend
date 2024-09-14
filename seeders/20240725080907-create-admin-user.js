const { UserRole } = require("../constants/roles");
var bcrypt = require("bcryptjs");

module.exports = {
  up: (queryInterface, Sequelize) => {
    let passwordHashed = bcrypt.hashSync("12345678", 10);
    return queryInterface.bulkInsert('Users', [
      {
        userName: 'admin',
        password: passwordHashed,
        role: UserRole.Admin,
        active: true,
        resetKey: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  },
};