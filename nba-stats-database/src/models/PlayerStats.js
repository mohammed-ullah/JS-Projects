const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlayerStats = sequelize.define('PlayerStats', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  player_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'players',
      key: 'id'
    }
  },
  game_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'games',
      key: 'id'
    }
  },
  team_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teams',
      key: 'id'
    }
  },
  minutes: {
    type: DataTypes.STRING,
    allowNull: true
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rebounds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  assists: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  steals: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  blocks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  turnovers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  field_goals_made: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  field_goals_attempted: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  three_pointers_made: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  three_pointers_attempted: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  free_throws_made: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  free_throws_attempted: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = PlayerStats;