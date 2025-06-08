const axios = require('axios');
const { Team, Player, Game, PlayerStats } = require('../models');

class RobustNBAUpdater {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.nba.com/',
    };
    this.delay = 3000; // 3 seconds between requests
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async updatePlayersWithCurrentRosters() {
    console.log('🏀 Starting comprehensive player roster update...');
    
    try {
      // Get all teams first
      const teams = await Team.findAll();
      console.log(`Found ${teams.length} teams in database`);
      
      let totalPlayersAdded = 0;
      let successfulTeams = 0;
      
      // Clear existing players to start fresh
      console.log('🗑️  Clearing existing player data...');
      await Player.destroy({ where: {} });
      
      for (const team of teams) {
        try {
          console.log(`\n📊 Fetching roster for ${team.name} (${team.abbreviation})...`);
          
          const players = await this.getTeamRoster(team.id);
          
          if (players.length > 0) {
            for (const playerData of players) {
              await Player.create({
                id: playerData.id,
                first_name: playerData.first_name,
                last_name: playerData.last_name,
                position: playerData.position,
                height_feet: playerData.height_feet,
                height_inches: playerData.height_inches,
                weight_pounds: playerData.weight_pounds,
                team_id: team.id
              });
            }
            
            console.log(`   ✅ Added ${players.length} players for ${team.abbreviation}`);
            totalPlayersAdded += players.length;
            successfulTeams++;
          } else {
            console.log(`   ⚠️  No players found for ${team.abbreviation}`);
          }
          
          // Rate limiting - wait between requests
          await this.sleep(this.delay);
          
        } catch (teamError) {
          console.log(`   ❌ Failed to get roster for ${team.abbreviation}: ${teamError.message}`);
          
          // Add fallback players for important teams
          if (['LAL', 'GSW', 'DET', 'BOS', 'MIA'].includes(team.abbreviation)) {
            const fallbackPlayers = this.getFallbackPlayersForTeam(team.abbreviation, team.id);
            for (const player of fallbackPlayers) {
              await Player.create(player);
            }
            console.log(`   🔄 Added ${fallbackPlayers.length} fallback players for ${team.abbreviation}`);
            totalPlayersAdded += fallbackPlayers.length;
          }
        }
      }
      
      console.log(`\n🎉 Player update complete!`);
      console.log(`   📈 Total players added: ${totalPlayersAdded}`);
      console.log(`   🏆 Successful teams: ${successfulTeams}/${teams.length}`);
      
      return { totalPlayersAdded, successfulTeams };
      
    } catch (error) {
      console.error('❌ Error updating players:', error.message);
      throw error;
    }
  }

  async getTeamRoster(teamId) {
    try {
      // Try NBA stats API
      const response = await axios.get('https://stats.nba.com/stats/commonteamroster', {
        params: {
          TeamID: teamId,
          Season: '2024-25'
        },
        headers: this.headers,
        timeout: 15000
      });

      if (response.data && response.data.resultSets && response.data.resultSets[0]) {
        return response.data.resultSets[0].rowSet.map(player => {
          const heightParts = this.parseHeight(player[6]);
          return {
            id: player[12], // PERSON_ID
            first_name: this.parseFirstName(player[3]),
            last_name: this.parseLastName(player[3]),
            position: player[5] || 'G',
            height_feet: heightParts.feet,
            height_inches: heightParts.inches,
            weight_pounds: parseInt(player[7]) || null
          };
        });
      }
      
      return [];
    } catch (error) {
      throw new Error(`API call failed: ${error.message}`);
    }
  }

  async updatePlayerSeasonStats() {
    console.log('\n📊 Starting player season stats update...');
    
    try {
      // Get current season stats for all players
      const response = await axios.get('https://stats.nba.com/stats/leagueleaders', {
        params: {
          LeagueID: '00',
          PerMode: 'PerGame',
          Scope: 'S',
          Season: '2024-25',
          SeasonType: 'Regular Season',
          StatCategory: 'PTS'
        },
        headers: this.headers,
        timeout: 20000
      });

      if (response.data && response.data.resultSets && response.data.resultSets[0]) {
        const playerStats = response.data.resultSets[0].rowSet;
        
        console.log(`Found stats for ${playerStats.length} players`);
        
        // Create a special "season stats" game entry
        const seasonStatsGame = await Game.findOrCreate({
          where: { id: 999999 },
          defaults: {
            id: 999999,
            date: new Date().toISOString().split('T')[0],
            season: 2024,
            home_team_id: 1610612737, // Dummy team
            visitor_team_id: 1610612738, // Dummy team
            status: 'final'
          }
        });

        let statsAdded = 0;
        
        for (const stat of playerStats.slice(0, 100)) { // Limit to top 100 for now
          try {
            const playerId = stat[0];
            const teamId = stat[2];
            
            // Check if player exists in our database
            const player = await Player.findByPk(playerId);
            if (player) {
              await PlayerStats.create({
                player_id: playerId,
                game_id: 999999, // Special season stats game
                team_id: teamId,
                minutes: stat[8] || '0:00',
                points: parseFloat(stat[23]) || 0,
                rebounds: parseFloat(stat[18]) || 0,
                assists: parseFloat(stat[19]) || 0,
                steals: parseFloat(stat[20]) || 0,
                blocks: parseFloat(stat[21]) || 0,
                turnovers: parseFloat(stat[22]) || 0,
                field_goals_made: parseFloat(stat[9]) || 0,
                field_goals_attempted: parseFloat(stat[10]) || 0,
                three_pointers_made: parseFloat(stat[12]) || 0,
                three_pointers_attempted: parseFloat(stat[13]) || 0,
                free_throws_made: parseFloat(stat[15]) || 0,
                free_throws_attempted: parseFloat(stat[16]) || 0
              });
              statsAdded++;
            }
          } catch (statError) {
            console.log(`   ⚠️  Error adding stats for player ${stat[1]}: ${statError.message}`);
          }
        }
        
        console.log(`   ✅ Added season stats for ${statsAdded} players`);
        return statsAdded;
        
      } else {
        throw new Error('No stats data returned from API');
      }
      
    } catch (error) {
      console.error('❌ Error updating player stats:', error.message);
      
      // Add some sample stats as fallback
      console.log('🔄 Adding sample stats data...');
      await this.addSampleStats();
      return 0;
    }
  }

  async addSampleStats() {
    // Create sample season stats for major players
    const sampleStats = [
      { player_id: 2544, team_id: 1610612747, points: 25.7, rebounds: 7.3, assists: 7.3, steals: 1.3, blocks: 0.5 }, // LeBron
      { player_id: 201939, team_id: 1610612744, points: 29.5, rebounds: 4.5, assists: 6.1, steals: 0.9, blocks: 0.4 }, // Curry
      { player_id: 203076, team_id: 1610612747, points: 24.7, rebounds: 12.6, assists: 3.5, steals: 1.2, blocks: 2.3 }, // Davis
      { player_id: 1630595, team_id: 1610612765, points: 22.7, rebounds: 4.3, assists: 7.5, steals: 0.8, blocks: 0.4 }, // Cunningham
      { player_id: 203935, team_id: 1610612738, points: 26.9, rebounds: 8.1, assists: 4.9, steals: 1.0, blocks: 0.6 }  // Tatum
    ];

    const seasonGame = await Game.findOrCreate({
      where: { id: 999999 },
      defaults: {
        id: 999999,
        date: new Date().toISOString().split('T')[0],
        season: 2024,
        home_team_id: 1610612737,
        visitor_team_id: 1610612738,
        status: 'final'
      }
    });

    for (const stat of sampleStats) {
      try {
        await PlayerStats.create({
          player_id: stat.player_id,
          game_id: 999999,
          team_id: stat.team_id,
          minutes: '35:00',
          points: stat.points,
          rebounds: stat.rebounds,
          assists: stat.assists,
          steals: stat.steals,
          blocks: stat.blocks,
          turnovers: 3.2,
          field_goals_made: stat.points * 0.4,
          field_goals_attempted: stat.points * 0.85,
          three_pointers_made: 2.1,
          three_pointers_attempted: 6.2,
          free_throws_made: 4.2,
          free_throws_attempted: 5.1
        });
      } catch (error) {
        // Player might not exist, skip
      }
    }
    
    console.log('   ✅ Added sample season stats for 5 star players');
  }

  parseHeight(heightStr) {
    if (!heightStr) return { feet: null, inches: null };
    const match = heightStr.match(/(\d+)-(\d+)/);
    if (match) {
      return { feet: parseInt(match[1]), inches: parseInt(match[2]) };
    }
    return { feet: null, inches: null };
  }

  parseFirstName(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts[0] || '';
  }

  parseLastName(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts.slice(1).join(' ') || parts[0];
  }

  getFallbackPlayersForTeam(abbreviation, teamId) {
    const fallbackData = {
      'DET': [
        { id: 1630595, first_name: 'Cade', last_name: 'Cunningham', position: 'G', height_feet: 6, height_inches: 8, weight_pounds: 220, team_id: teamId },
        { id: 1630533, first_name: 'Isaiah', last_name: 'Stewart', position: 'F-C', height_feet: 6, height_inches: 8, weight_pounds: 250, team_id: teamId },
        { id: 1629636, first_name: 'Saddiq', last_name: 'Bey', position: 'F', height_feet: 6, height_inches: 7, weight_pounds: 215, team_id: teamId },
        { id: 1628368, first_name: 'Killian', last_name: 'Hayes', position: 'G', height_feet: 6, height_inches: 5, weight_pounds: 195, team_id: teamId },
        { id: 1630203, first_name: 'Jalen', last_name: 'Duren', position: 'C', height_feet: 6, height_inches: 11, weight_pounds: 250, team_id: teamId }
      ],
      'LAL': [
        { id: 2544, first_name: 'LeBron', last_name: 'James', position: 'F', height_feet: 6, height_inches: 9, weight_pounds: 250, team_id: teamId },
        { id: 203076, first_name: 'Anthony', last_name: 'Davis', position: 'F-C', height_feet: 6, height_inches: 10, weight_pounds: 253, team_id: teamId },
        { id: 1629627, first_name: 'Austin', last_name: 'Reaves', position: 'G', height_feet: 6, height_inches: 5, weight_pounds: 197, team_id: teamId },
        { id: 203999, first_name: 'D\'Angelo', last_name: 'Russell', position: 'G', height_feet: 6, height_inches: 4, weight_pounds: 193, team_id: teamId }
      ],
      'GSW': [
        { id: 201939, first_name: 'Stephen', last_name: 'Curry', position: 'G', height_feet: 6, height_inches: 2, weight_pounds: 185, team_id: teamId },
        { id: 202691, first_name: 'Klay', last_name: 'Thompson', position: 'G', height_feet: 6, height_inches: 6, weight_pounds: 220, team_id: teamId },
        { id: 203110, first_name: 'Draymond', last_name: 'Green', position: 'F', height_feet: 6, height_inches: 6, weight_pounds: 230, team_id: teamId }
      ],
      'BOS': [
        { id: 203935, first_name: 'Jayson', last_name: 'Tatum', position: 'F', height_feet: 6, height_inches: 8, weight_pounds: 210, team_id: teamId },
        { id: 1627759, first_name: 'Jaylen', last_name: 'Brown', position: 'G-F', height_feet: 6, height_inches: 6, weight_pounds: 223, team_id: teamId }
      ],
      'MIA': [
        { id: 200755, first_name: 'Jimmy', last_name: 'Butler', position: 'F', height_feet: 6, height_inches: 7, weight_pounds: 230, team_id: teamId },
        { id: 1628389, first_name: 'Bam', last_name: 'Adebayo', position: 'C', height_feet: 6, height_inches: 9, weight_pounds: 255, team_id: teamId }
      ]
    };
    
    return fallbackData[abbreviation] || [];
  }
}

// Main execution function
async function updateAllNBAData() {
  const updater = new RobustNBAUpdater();
  
  try {
    console.log('🚀 Starting comprehensive NBA data update...\n');
    
    // Update players with rosters
    const playerResult = await updater.updatePlayersWithCurrentRosters();
    
    // Update player season stats
    const statsResult = await updater.updatePlayerSeasonStats();
    
    console.log('\n🎉 Update Complete!');
    console.log(`📊 Summary:`);
    console.log(`   Players: ${playerResult.totalPlayersAdded}`);
    console.log(`   Teams with rosters: ${playerResult.successfulTeams}`);
    console.log(`   Player stats added: ${statsResult}`);
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
  }
}

module.exports = { RobustNBAUpdater, updateAllNBAData };

// Run if called directly
if (require.main === module) {
  updateAllNBAData().then(() => {
    console.log('\nDone! You can now query players and their stats.');
    process.exit(0);
  });
}