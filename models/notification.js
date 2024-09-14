"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Notification extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */

		

		static associate(models) {

		}
	}
	Notification.init(
		{
			content: DataTypes.TEXT,
            type: DataTypes.INTEGER,
            toUserId: DataTypes.INTEGER,
            title: DataTypes.TEXT,
            seen: DataTypes.BOOLEAN,
            seenAt: DataTypes.DATE,
            actionType: DataTypes.INTEGER,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "Notification",
		},
	);
	sequelizePaginate.paginate(Notification);
	return Notification;
};
