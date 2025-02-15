let Sequelize = require('sequelize');
let sequelize = new Sequelize('exp_prac', 'root', 'Password', {
    dialect: 'mysql',
    host: 'localhost'
})
module.exports = sequelize