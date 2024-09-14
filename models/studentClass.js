"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class StudentClass extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */

		

		static associate(models) {

		}
	}
	StudentClass.init(
		{
			studentId: DataTypes.INTEGER,
            classId: DataTypes.INTEGER,
            offSession: DataTypes.INTEGER,
            reduceFee: DataTypes.DOUBLE,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "StudentClass",
		},
	);
	sequelizePaginate.paginate(StudentClass);
	return StudentClass;
};
