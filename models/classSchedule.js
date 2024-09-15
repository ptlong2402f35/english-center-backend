"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class ClassSchedule extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */

		

		static associate(models) {
			ClassSchedule.belongsTo(models.Class, {
                foreignKey: "classId",
                as: "class"
            });
			ClassSchedule.belongsTo(models.Schedule, {
                foreignKey: "scheduleId",
                as: "schedule"
            });
		}
	}
	ClassSchedule.init(
		{
			classId: DataTypes.INTEGER,
            scheduleId: DataTypes.INTEGER,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "ClassSchedule",
		},
	);
	sequelizePaginate.paginate(ClassSchedule);
	return ClassSchedule;
};
