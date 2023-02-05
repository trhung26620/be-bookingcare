'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Bill extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Bill.hasOne(models.Booking, { foreignKey: 'billId' })
            // , as: 'billData'
            // User.hasOne(models.Doctor_Infor, { foreignKey: 'doctorId' })
            // define association here
        }
    };
    Bill.init({
        billId: DataTypes.STRING,
        amount: DataTypes.STRING,
        weiAmount: DataTypes.STRING,
        paidWei: DataTypes.STRING,
        isPayment: DataTypes.BOOLEAN,
    }, {
        sequelize,
        modelName: 'Bill',
    });
    return Bill;
};