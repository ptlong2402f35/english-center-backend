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

		

		static associate(models) {
			Cost.belongsTo(models.User, {
                foreignKey: "forUserId",
                as: "user",
				attributes: ["id", "role"]
            });
			Cost.hasMany(models.Transaction, {
                foreignKey: "costId",
                as: "transactions"
            });
		}
	}
	Cost.init(
		{
			referenceId: DataTypes.INTEGER,
            type: DataTypes.INTEGER,
            status: DataTypes.INTEGER,
            totalMoney: DataTypes.INTEGER,
            forMonth: DataTypes.INTEGER,
            otherType: DataTypes.INTEGER,
			forUserId: DataTypes.INTEGER,
			debtMoney: DataTypes.DOUBLE,
			paidMoney: DataTypes.DOUBLE,
			forYear: DataTypes.INTEGER,
			paidAt: DataTypes.DATE,
			name: DataTypes.TEXT,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
			timerTime: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "Cost",
		},
	);
	sequelizePaginate.paginate(Cost);
	return Cost;
};
