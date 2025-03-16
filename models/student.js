"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Student extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */

		static associate(models) {
			Student.belongsTo(models.User, {
                foreignKey: "userId",
                as: "user"
            });
			Student.belongsToMany(models.Class, {
				through: "StudentClasses",
				foreignKey: "studentId",
				// sourceKey: "id",
				// targetKey: "id",
				as: "classes",
			});
			Student.belongsToMany(models.Parent, {
				through: "ParentStudents",
				foreignKey: "studentId",
				// sourceKey: "id",
				// targetKey: "id",
				as: "parents",
			});
		}
	}
	Student.init(
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
			en_name: DataTypes.TEXT,
            en_gender: DataTypes.TEXT,
            en_birthday: DataTypes.TEXT,
            en_age: DataTypes.TEXT,
            en_address: DataTypes.TEXT,
            en_phone: DataTypes.TEXT,
            en_email: DataTypes.TEXT,
		},
		{
			sequelize,
			modelName: "Student",
		},
	);
	sequelizePaginate.paginate(Student);
	return Student;
};
