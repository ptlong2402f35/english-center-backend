"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
const { UserRole } = require("../constants/roles");
module.exports = (sequelize, DataTypes) => {
	class Request extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */

		

		static associate(models) {
			Request.belongsTo(models.Student, {
				foreignKey: "studentId",
				as: 'requestByStudent',
			});
			Request.belongsTo(models.Parent, {
				foreignKey: "parentId",
				as: 'requestByParent',
			});
		}
	}
	Request.init(
		{
			studentId: DataTypes.INTEGER,
            parentId: DataTypes.INTEGER,
            status: DataTypes.INTEGER,
			requestByRoleId: DataTypes.INTEGER,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "Request",
		},
	);
	sequelizePaginate.paginate(Request);
	return Request;
};
