const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Player = sequelize.define('Player', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false // We'll use NBA's player IDs
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true
  },
  height_feet: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  height_inches: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  weight_pounds: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  team_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teams',
      key: 'id'
    }
  }
});

module.exports = Player;