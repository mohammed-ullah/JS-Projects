const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  season: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  home_team_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teams',
      key: 'id'
    }
  },
  visitor_team_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teams',
      key: 'id'
    }
  },
  home_team_score: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  visitor_team_score: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in_progress', 'final'),
    defaultValue: 'scheduled'
  },
  period: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  time: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Game;