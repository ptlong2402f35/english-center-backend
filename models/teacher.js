"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Teacher extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */

		toJSON() {
		}

		static associate(models) {

		}
	}
	Teacher.init(
		{
			name: DataTypes.STRING,
            gender: DataTypes.INTEGER,
            birthday: DataTypes.DATE,
            age: DataTypes.INTEGER,
            address: DataTypes.TEXT,
            phone: DataTypes.STRING,
            email: DataTypes.STRING,
            userId: DataTypes.INTEGER,
            active: DataTypes.BOOLEAN,
            level: DataTypes.INTEGER,
            salary: DataTypes.DOUBLE,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "Teacher",
		},
	);
	sequelizePaginate.paginate(Teacher);
	return Teacher;
};
