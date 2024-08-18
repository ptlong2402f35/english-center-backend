"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Cost extends Model {
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
	Cost.init(
		{
			teacherId: DataTypes.INTEGER,
            type: DataTypes.INTEGER,
            status: DataTypes.INTEGER,
            totalMoney: DataTypes.INTEGER,
            forMonth: DataTypes.INTEGER,
            otherType: DataTypes.INTEGER,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "Cost",
		},
	);
	sequelizePaginate.paginate(Cost);
	return Cost;
};
