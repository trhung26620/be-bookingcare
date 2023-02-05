'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Booking extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Booking.belongsTo(models.User, { foreignKey: 'patientId', targetKey: 'id', as: 'patientData' })
            Booking.belongsTo(models.User, { foreignKey: 'doctorId', targetKey: 'id', as: 'doctorIdBooking' })
            Booking.belongsTo(models.Allcode, { foreignKey: 'timeType', targetKey: 'keyMap', as: 'timeTypeDataPatient' })
            Booking.belongsTo(models.Bill, { foreignKey: 'billId', targetKey: 'billId' })
            // , as: 'billData'
            // Booking.belongsTo(models.Bill, { foreignKey: 'doctorId' })

            // define association here
        }
    };
    Booking.init({
        statusId: DataTypes.STRING,
        doctorId: DataTypes.INTEGER,
        patientId: DataTypes.INTEGER,
        date: DataTypes.STRING,
        timeType: DataTypes.STRING,
        token: DataTypes.STRING,
        billId: DataTypes.STRING,
        isInitPayment: DataTypes.BOOLEAN,
    }, {
        sequelize,
        modelName: 'Booking',
    });
    return Booking;
};