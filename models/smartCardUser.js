"use strict";
const sequelizePaginate = require("sequelize-paginate");
const { Model } = require("sequelize");
const PROTECTED_ATTRIBUTES = ["password", "resetKey"];
module.exports = (sequelize, DataTypes) => {
    class SmartCardUser extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */

        // toJSON() {
        //     // hide protected fields
        //     let attributes = Object.assign({}, this.get());
        //     for (let a of PROTECTED_ATTRIBUTES) {
        //         delete attributes[a];
        //     }
        //     return attributes;
        // }

        static associate(models) {
            // define association here
        }
    }
    SmartCardUser.init(
        {
            cardId: DataTypes.TEXT,
            name: DataTypes.TEXT,
            phone: DataTypes.TEXT,
            publicKey: DataTypes.TEXT,
            image: DataTypes.TEXT,
            point: DataTypes.INTEGER,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "SmartCardUser",
        },
    );
    sequelizePaginate.paginate(SmartCardUser);
    return SmartCardUser;
};
