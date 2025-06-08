const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false // We'll use NBA's team IDs
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  abbreviation: {
    type: DataTypes.STRING(3),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  conference: {
    type: DataTypes.ENUM('Eastern', 'Western'),
    allowNull: false
  },
  division: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Team;