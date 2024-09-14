"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Attendance extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */

		

		static associate(models) {

		}
	}
	Attendance.init(
		{
			studentId: DataTypes.INTEGER,
            classId: DataTypes.INTEGER,
            date: DataTypes.DATE,
            status: DataTypes.INTEGER,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "Attendance",
		},
	);
	sequelizePaginate.paginate(Attendance);
	return Attendance;
};
