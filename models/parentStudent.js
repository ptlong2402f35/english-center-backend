"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class ParentStudent extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */

		

		static associate(models) {

		}
	}
	ParentStudent.init(
		{
			studentId: DataTypes.INTEGER,
            parentId: DataTypes.INTEGER,
            createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "ParentStudent",
		},
	);
	sequelizePaginate.paginate(ParentStudent);
	return ParentStudent;
};
