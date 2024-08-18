"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
const PROTECTED_ATTRIBUTES = ["password", "resetKey"];
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */

		toJSON() {
			// hide protected fields
			let attributes = Object.assign({}, this.get());
			for (let a of PROTECTED_ATTRIBUTES) {
				delete attributes[a];
			}
			return attributes;
		}

		static associate(models) {
			// define association here
            
		}
	}
	User.init(
		{
			userName: DataTypes.STRING,
			password: DataTypes.TEXT,
			role: DataTypes.INTEGER,
            active: DataTypes.BOOLEAN,
			totalMoney: DataTypes.DOUBLE,
			resetKey: DataTypes.TEXT,
			resetKeyExpiredAt: DataTypes.DATE,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "User",
		},
	);
	sequelizePaginate.paginate(User);
	return User;
};
