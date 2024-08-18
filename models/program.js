"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Program extends Model {
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
	Program.init(
		{
			reducePercent: DataTypes.DOUBLE,
            reduceValue: DataTypes.DOUBLE,
            startAt: DataTypes.DATE,
            endAt: DataTypes.DATE,
            status: DataTypes.INTEGER,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "Program",
		},
	);
	sequelizePaginate.paginate(Program);
	return Program;
};
