"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Review extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */

		

		static associate(models) {
			Review.belongsTo(models.Attendance, {
				foreignKey: "classId",
				as: "attendance",
			});
		}
	}
	Review.init(
		{
			generalContent: DataTypes.TEXT,
            specificContent: DataTypes.TEXT,
			sessionContent: DataTypes.TEXT,
            type: DataTypes.INTEGER,
            referenceId: DataTypes.INTEGER,
            title: DataTypes.TEXT,
            attendanceId: DataTypes.INTEGER,
            classId: DataTypes.INTEGER,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "Review",
		},
	);
	sequelizePaginate.paginate(Review);
	return Review;
};
