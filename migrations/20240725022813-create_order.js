"use strict";

const { OrderRefundStatus, OrderStatus } = require("../constants/status");

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Orders", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			customerUserId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			partnerId: {
				type: Sequelize.INTEGER,
        allowNull: false
			},
			transactionId: {
				type: Sequelize.INTEGER,
        allowNull: true
			},
			email: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			phone: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			quantity: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			totalMoney: {
				type: Sequelize.DOUBLE,
				allowNull: false,
			},
      timeIn: {
				type: Sequelize.DATE,
				allowNull: false,
			},
      timeOut: {
				type: Sequelize.DATE,
				allowNull: false,
			},
      paymentMethod: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
      status: {
				type: Sequelize.INTEGER,
				allowNull: false,
        defaultValue: OrderStatus.Pending
			},
      refundStatus: {
				type: Sequelize.INTEGER,
				allowNull: false,
        defaultValue: OrderRefundStatus.Idle
			},
      paypalPaymentId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
      onepayPaymentId: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			createdAt: {
				type: Sequelize.DATE,
        defaultValue: new Date(), 
				allowNull: false,
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
        defaultValue: new Date()
			},
		});

    await queryInterface.addIndex("Orders", ["customerUserId"]);
    await queryInterface.addIndex("Orders", ["partnerId"]);

	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("Orders");
	},
};
