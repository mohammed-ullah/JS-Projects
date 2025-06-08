const Team = require('./Team');
const Player = require('./Player');
const Game = require('./Game');
const PlayerStats = require('./PlayerStats');

// Define associations
Team.hasMany(Player, { foreignKey: 'team_id' });
Player.belongsTo(Team, { foreignKey: 'team_id' });

Game.belongsTo(Team, { as: 'HomeTeam', foreignKey: 'home_team_id' });
Game.belongsTo(Team, { as: 'VisitorTeam', foreignKey: 'visitor_team_id' });

PlayerStats.belongsTo(Player, { foreignKey: 'player_id' });
PlayerStats.belongsTo(Game, { foreignKey: 'game_id' });
PlayerStats.belongsTo(Team, { foreignKey: 'team_id' });

Player.hasMany(PlayerStats, { foreignKey: 'player_id' });
Game.hasMany(PlayerStats, { foreignKey: 'game_id' });

module.exports = {
  Team,
  Player,
  Game,
  PlayerStats
};