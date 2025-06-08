const nbaApi = require('./nbaApi');
const { Team, Player, Game, PlayerStats } = require('../models');

class DataUpdater {
  async updateTeams() {
    console.log('Updating teams...');
    try {
      const teams = await nbaApi.getAllTeams();
      
      for (const teamData of teams) {
        await Team.upsert({
          id: teamData.id,
          name: teamData.full_name,
          abbreviation: teamData.abbreviation,
          city: teamData.city,
          conference: teamData.conference,
          division: teamData.division
        });
      }
      
      console.log(`Updated ${teams.length} teams`);
    } catch (error) {
      console.error('Error updating teams:', error.message);
    }
  }

  async updatePlayers() {
    console.log('Updating players...');
    try {
      let page = 1;
      let hasMorePages = true;
      let totalPlayers = 0;

      while (hasMorePages) {
        const response = await nbaApi.getAllPlayers(page);
        const players = response.data;
        
        if (players.length === 0) {
          hasMorePages = false;
          break;
        }

        for (const playerData of players) {
          await Player.upsert({
            id: playerData.id,
            first_name: playerData.first_name,
            last_name: playerData.last_name,
            position: playerData.position,
            height_feet: playerData.height_feet,
            height_inches: playerData.height_inches,
            weight_pounds: playerData.weight_pounds,
            team_id: playerData.team ? playerData.team.id : null
          });
        }

        totalPlayers += players.length;
        console.log(`Processed page ${page}, total players: ${totalPlayers}`);
        
        if (response.meta.current_page >= response.meta.total_pages) {
          hasMorePages = false;
        } else {
          page++;
        }

        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`Updated ${totalPlayers} players`);
    } catch (error) {
      console.error('Error updating players:', error.message);
    }
  }

  async updateTodaysGames() {
    console.log('Updating today\'s games...');
    try {
      const response = await nbaApi.getTodaysGames();
      const games = response.data;

      for (const gameData of games) {
        await Game.upsert({
          id: gameData.id,
          date: gameData.date.split('T')[0],
          season: gameData.season,
          home_team_id: gameData.home_team.id,
          visitor_team_id: gameData.visitor_team.id,
          home_team_score: gameData.home_team_score,
          visitor_team_score: gameData.visitor_team_score,
          status: gameData.status === 'Final' ? 'final' : 
                 gameData.status.includes('Qtr') ? 'in_progress' : 'scheduled',
          period: gameData.period,
          time: gameData.time
        });
      }

      console.log(`Updated ${games.length} games for today`);
      return games;
    } catch (error) {
      console.error('Error updating games:', error.message);
    }
  }

  async updateGameStats(gameId) {
    console.log(`Updating stats for game ${gameId}...`);
    try {
      const response = await nbaApi.getPlayerStats(gameId);
      const stats = response.data;

      for (const statData of stats) {
        await PlayerStats.upsert({
          player_id: statData.player.id,
          game_id: statData.game.id,
          team_id: statData.team.id,
          minutes: statData.min,
          points: statData.pts,
          rebounds: statData.reb,
          assists: statData.ast,
          steals: statData.stl,
          blocks: statData.blk,
          turnovers: statData.turnover,
          field_goals_made: statData.fgm,
          field_goals_attempted: statData.fga,
          three_pointers_made: statData.fg3m,
          three_pointers_attempted: statData.fg3a,
          free_throws_made: statData.ftm,
          free_throws_attempted: statData.fta
        }, {
          where: { player_id: statData.player.id, game_id: statData.game.id }
        });
      }

      console.log(`Updated ${stats.length} player stats for game ${gameId}`);
    } catch (error) {
      console.error(`Error updating game ${gameId} stats:`, error.message);
    }
  }
}

module.exports = new DataUpdater();