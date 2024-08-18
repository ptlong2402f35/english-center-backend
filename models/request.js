"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Request extends Model {
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
	Request.init(
		{
			studentId: DataTypes.INTEGER,
            parentId: DataTypes.INTEGER,
            status: DataTypes.INTEGER,
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
