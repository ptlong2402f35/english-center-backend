"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Class extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */

		static associate(models) {
			Class.belongsToMany(models.Schedule, {
				through: "ClassSchedules",
				foreignKey: "classId",
				// sourceKey: "id",
				// targetKey: "id",
				as: "schedules",
			});
			Class.belongsToMany(models.Student, {
				through: "StudentClasses",
				foreignKey: "classId",
				// sourceKey: "id",
				// targetKey: "id",
				as: "students",
			});
			Class.belongsToMany(models.Teacher, {
				through: "TeacherClasses",
				foreignKey: "classId",
				// sourceKey: "id",
				// targetKey: "id",
				as: "teachers",
			});
			Class.belongsTo(models.Program, {
				foreignKey: "programId",
				as: "program",
			});
			Class.belongsTo(models.Center, {
				foreignKey: "centerId",
				as: "center",
			});
			Class.hasMany(models.Attendance, {
				foreignKey: "classId",
				as: "attendances",
			});
		}
	}
	Class.init(
		{
			name: DataTypes.STRING,
            fromAge: DataTypes.INTEGER,
            toAge: DataTypes.INTEGER,
            startAt: DataTypes.DATE,
            endAt: DataTypes.DATE,
            studentQuantity: DataTypes.INTEGER,
            maxQuantity: DataTypes.INTEGER,
            fee: DataTypes.DOUBLE,
            totalSession: DataTypes.INTEGER,
            teachedSession: DataTypes.INTEGER,
            status: DataTypes.INTEGER,
            programId: DataTypes.INTEGER,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
			centerId: DataTypes.INTEGER,
			code: DataTypes.TEXT
		},
		{
			sequelize,
			modelName: "Class",
		},
	);
	sequelizePaginate.paginate(Class);
	return Class;
};
