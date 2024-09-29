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
            User.hasOne(models.Student, {
                foreignKey: "userId",
                as: "student"
            });
            User.hasOne(models.Parent, {
                foreignKey: "userId",
                as: "parent"
            });
			User.hasOne(models.Teacher, {
                foreignKey: "userId",
                as: "teacher"
            });
            User.hasMany(models.Transaction, {
                foreignKey: "forUserId",
                as: "transactions"
            });
		}
	}
	User.init(
		{
			userName: DataTypes.STRING,
			password: DataTypes.TEXT,
			role: DataTypes.INTEGER,
            active: DataTypes.BOOLEAN,
			resetKey: DataTypes.TEXT,
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
