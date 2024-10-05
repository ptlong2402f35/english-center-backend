"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Transaction extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */

		

		static associate(models) {
			Transaction.belongsTo(models.User, {
                foreignKey: "forUserId",
                as: "user"
            });
			Transaction.belongsTo(models.Cost, {
                foreignKey: "costId",
                as: "cost"
            });
		}
	}
	Transaction.init(
		{
			forUserId: DataTypes.INTEGER,
            createdByUserId: DataTypes.INTEGER,
            content: DataTypes.TEXT,
            totalMoney: DataTypes.DOUBLE,
            costId: DataTypes.INTEGER,
			costType: DataTypes.INTEGER,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
			timerTime: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "Transaction",
		},
	);
	sequelizePaginate.paginate(Transaction);
	return Transaction;
};
