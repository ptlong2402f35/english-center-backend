"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class TeacherClass extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */

		

		static associate(models) {
			TeacherClass.belongsTo(models.Class, {
				foreignKey: "classId",
				as: "class",
			});
		}
	}
	TeacherClass.init(
		{
			teacherId: DataTypes.INTEGER,
            classId: DataTypes.INTEGER,
            salary: DataTypes.DOUBLE,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "TeacherClass",
		},
	);
	sequelizePaginate.paginate(TeacherClass);
	return TeacherClass;
};
