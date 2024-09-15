"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Schedule extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */

		static associate(models) {
			Schedule.belongsToMany(models.Class, {
				through: "ClassSchedules",
				foreignKey: "scheduleId",
				// sourceKey: "id",
				// targetKey: "id",
				as: "classes",
			});
		}
	}
	Schedule.init(
		{
			date: DataTypes.INTEGER,
			startAt: DataTypes.STRING,
			endAt: DataTypes.STRING,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "Schedule",
		},
	);
	sequelizePaginate.paginate(Schedule);
	return Schedule;
};
