const Sequelize = require('sequelize');

const sequelize = new Sequelize('order_schema', 'root', 'qwerty123', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
