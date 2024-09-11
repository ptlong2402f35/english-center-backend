"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Center extends Model {
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
	Center.init(
		{
			name: DataTypes.TEXT,
            address: DataTypes.TEXT,
            phone: DataTypes.STRING,
            status: DataTypes.INTEGER,
            images: DataTypes.JSON,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "Center",
		},
	);
	sequelizePaginate.paginate(Center);
	return Center;
};
