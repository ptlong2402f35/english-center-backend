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

		toJSON() {
		}

		static associate(models) {

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
			centerId: DataTypes.INTEGER
		},
		{
			sequelize,
			modelName: "Class",
		},
	);
	sequelizePaginate.paginate(Class);
	return Class;
};
