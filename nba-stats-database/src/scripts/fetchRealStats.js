const axios = require('axios');
const { Player, Team, Game, PlayerStats } = require('../models');

class ESPNStatsService {
  constructor() {
    this.baseUrl = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    };
  }

  async getPlayerStats(espnPlayerId) {
    try {
      console.log(`   📊 Fetching stats for ESPN player ID: ${espnPlayerId}`);
      
      const response = await axios.get(`${this.baseUrl}/athletes/${espnPlayerId}/statistics`, {
        headers: this.headers,
        timeout: 10000
      });

      if (response.data && response.data.statistics && response.data.statistics.length > 0) {
        // Find current season stats (usually the first or most recent entry)
        const currentSeasonStats = response.data.statistics.find(stat => 
          stat.season && (stat.season.year === 2025 || stat.season.year === 2024)
        ) || response.data.statistics[0];

        if (currentSeasonStats && currentSeasonStats.categories) {
          return this.parseESPNStats(currentSeasonStats.categories);
        }
      }
      
      return null;
    } catch (error) {
      console.log(`   ⚠️  Stats fetch failed for player ${espnPlayerId}: ${error.message}`);
      return null;
    }
  }

  parseESPNStats(categories) {
    const stats = {
      points: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      minutes: '0:00',
      field_goals_made: 0,
      field_goals_attempted: 0,
      three_pointers_made: 0,
      three_pointers_attempted: 0,
      free_throws_made: 0,
      free_throws_attempted: 0
    };

    try {
      // ESPN organizes stats in categories, we need to find the right ones
      for (const category of categories) {
        if (category.stats) {
          for (const stat of category.stats) {
            const name = stat.name?.toLowerCase() || '';
            const value = parseFloat(stat.value) || 0;

            // Map ESPN stat names to our database fields
            if (name.includes('points') && name.includes('per game')) {
              stats.points = Math.round(value);
            } else if (name.includes('rebounds') && name.includes('per game')) {
              stats.rebounds = Math.round(value);
            } else if (name.includes('assists') && name.includes('per game')) {
              stats.assists = Math.round(value);
            } else if (name.includes('steals') && name.includes('per game')) {
              stats.steals = Math.round(value * 10) / 10; // Keep one decimal
            } else if (name.includes('blocks') && name.includes('per game')) {
              stats.blocks = Math.round(value * 10) / 10;
            } else if (name.includes('turnovers') && name.includes('per game')) {
              stats.turnovers = Math.round(value * 10) / 10;
            } else if (name.includes('minutes') && name.includes('per game')) {
              stats.minutes = this.formatMinutes(value);
            } else if (name.includes('field goals made') && name.includes('per game')) {
              stats.field_goals_made = Math.round(value * 10) / 10;
            } else if (name.includes('field goals attempted') && name.includes('per game')) {
              stats.field_goals_attempted = Math.round(value * 10) / 10;
            } else if (name.includes('3-point field goals made') && name.includes('per game')) {
              stats.three_pointers_made = Math.round(value * 10) / 10;
            } else if (name.includes('3-point field goals attempted') && name.includes('per game')) {
              stats.three_pointers_attempted = Math.round(value * 10) / 10;
            } else if (name.includes('free throws made') && name.includes('per game')) {
              stats.free_throws_made = Math.round(value * 10) / 10;
            } else if (name.includes('free throws attempted') && name.includes('per game')) {
              stats.free_throws_attempted = Math.round(value * 10) / 10;
            }
          }
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Error parsing stats: ${error.message}`);
    }

    return stats;
  }

  formatMinutes(totalMinutes) {
    const minutes = Math.floor(totalMinutes);
    const seconds = Math.round((totalMinutes - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  async getESPNPlayerIdFromName(firstName, lastName) {
    try {
      // Search for player by name
      const searchQuery = `${firstName} ${lastName}`.replace(' ', '%20');
      const response = await axios.get(`${this.baseUrl}/athletes`, {
        params: { search: searchQuery },
        headers: this.headers,
        timeout: 10000
      });

      if (response.data && response.data.athletes && response.data.athletes.length > 0) {
        const player = response.data.athletes.find(athlete => 
          athlete.firstName?.toLowerCase() === firstName.toLowerCase() &&
          athlete.lastName?.toLowerCase() === lastName.toLowerCase()
        );
        
        return player ? player.id : null;
      }
      
      return null;
    } catch (error) {
      console.log(`   ⚠️  Player search failed for ${firstName} ${lastName}: ${error.message}`);
      return null;
    }
  }
}

async function fetchRealESPNStats() {
  console.log('🏀 Fetching REAL player statistics from ESPN...\n');
  
  const espnService = new ESPNStatsService();
  
  try {
    // Create a special "real season stats" game entry
    const realStatsGame = await Game.findOrCreate({
      where: { id: 555555 },
      defaults: {
        id: 555555,
        date: '2024-12-01',
        season: 2024,
        home_team_id: 1610612737,
        visitor_team_id: 1610612738,
        status: 'final'
      }
    });

    // Clear existing real stats
    await PlayerStats.destroy({ where: { game_id: 555555 } });

    // Get all players from our database
    const allPlayers = await Player.findAll({
      include: [{
        model: Team,
        attributes: ['abbreviation', 'name']
      }]
    });

    console.log(`Found ${allPlayers.length} players in database\n`);

    let statsAdded = 0;
    let playersProcessed = 0;

    for (const player of allPlayers) {
      try {
        playersProcessed++;
        console.log(`[${playersProcessed}/${allPlayers.length}] Processing ${player.first_name} ${player.last_name} (${player.Team?.abbreviation || 'N/A'})`);

        // Try to find ESPN player ID
        const espnPlayerId = await espnService.getESPNPlayerIdFromName(player.first_name, player.last_name);
        
        if (!espnPlayerId) {
          console.log(`   ❌ Could not find ESPN ID for ${player.first_name} ${player.last_name}`);
          continue;
        }

        // Fetch real stats
        const realStats = await espnService.getPlayerStats(espnPlayerId);
        
        if (realStats) {
          await PlayerStats.create({
            player_id: player.id,
            game_id: 555555,
            team_id: player.team_id,
            minutes: realStats.minutes,
            points: realStats.points,
            rebounds: realStats.rebounds,
            assists: realStats.assists,
            steals: Math.round(realStats.steals * 10) / 10,
            blocks: Math.round(realStats.blocks * 10) / 10,
            turnovers: Math.round(realStats.turnovers * 10) / 10,
            field_goals_made: Math.round(realStats.field_goals_made * 10) / 10,
            field_goals_attempted: Math.round(realStats.field_goals_attempted * 10) / 10,
            three_pointers_made: Math.round(realStats.three_pointers_made * 10) / 10,
            three_pointers_attempted: Math.round(realStats.three_pointers_attempted * 10) / 10,
            free_throws_made: Math.round(realStats.free_throws_made * 10) / 10,
            free_throws_attempted: Math.round(realStats.free_throws_attempted * 10) / 10
          });

          statsAdded++;
          console.log(`   ✅ Added real stats: ${realStats.points} PPG, ${realStats.rebounds} RPG, ${realStats.assists} APG`);
        } else {
          console.log(`   ❌ No stats found for ${player.first_name} ${player.last_name}`);
        }

        // Rate limiting - be nice to ESPN
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.log(`   ❌ Error processing ${player.first_name} ${player.last_name}: ${error.message}`);
      }
    }

    console.log(`\n🎉 Real stats update complete!`);
    console.log(`   📊 Players processed: ${playersProcessed}`);
    console.log(`   ✅ Real stats added: ${statsAdded}`);

    if (statsAdded > 0) {
      // Show top performers with real stats
      console.log('\n🏆 Top Real Performers:');
      
      const topStats = await PlayerStats.findAll({
        where: { game_id: 555555 },
        include: [{
          model: Player,
          include: [Team]
        }],
        order: [['points', 'DESC']],
        limit: 5
      });

      topStats.forEach((stat, index) => {
        console.log(`   ${index + 1}. ${stat.Player.first_name} ${stat.Player.last_name} (${stat.Player.Team?.abbreviation}): ${stat.points} PPG, ${stat.rebounds} RPG, ${stat.assists} APG`);
      });
    }

  } catch (error) {
    console.error('❌ Error fetching real stats:', error.message);
  }
}

module.exports = { fetchRealESPNStats, ESPNStatsService };

// Run if called directly
if (require.main === module) {
  fetchRealESPNStats().then(() => {
    console.log('\n✅ Done! Query your real NBA stats now.');
    process.exit(0);
  });
}