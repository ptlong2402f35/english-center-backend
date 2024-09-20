"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Parent extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */

		

		static associate(models) {
			Parent.belongsToMany(models.Student, {
				through: "ParentStudents",
				foreignKey: "parentId",
				// sourceKey: "id",
				// targetKey: "id",
				as: "childs",
			});
		}
	}
	Parent.init(
		{
			name: DataTypes.STRING,
            gender: DataTypes.INTEGER,
            birthday: DataTypes.DATE,
            age: DataTypes.INTEGER,
            address: DataTypes.TEXT,
            phone: DataTypes.STRING,
            email: DataTypes.STRING,
            userId: DataTypes.INTEGER,
            active: DataTypes.BOOLEAN,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "Parent",
		},
	);
	sequelizePaginate.paginate(Parent);
	return Parent;
};
