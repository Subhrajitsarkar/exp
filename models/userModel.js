let Sequelize = require('sequelize')
let sequelize = require('../utils/database');

let User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    ispremiumuser: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    totalExpenses: {
        type: Sequelize.STRING,
        defaultValue: 0,
    }
})
module.exports = User