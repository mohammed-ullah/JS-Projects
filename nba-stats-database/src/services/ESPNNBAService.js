const axios = require('axios');

class ESPNNBAService {
  constructor() {
    this.baseUrl = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    };
    
    // ESPN Team ID mapping
    this.teamMapping = {
      'ATL': 1, 'BOS': 2, 'BKN': 17, 'CHA': 30, 'CHI': 4, 'CLE': 5,
      'DAL': 6, 'DEN': 7, 'DET': 8, 'GSW': 9, 'HOU': 10, 'IND': 11,
      'LAC': 12, 'LAL': 13, 'MEM': 29, 'MIA': 14, 'MIL': 15, 'MIN': 16,
      'NOP': 3, 'NYK': 18, 'OKC': 25, 'ORL': 19, 'PHI': 20, 'PHX': 21,
      'POR': 22, 'SAC': 23, 'SAS': 24, 'TOR': 28, 'UTA': 26, 'WAS': 27
    };
  }

  async getAllTeams() {
    try {
      console.log('🏀 Fetching teams from ESPN API...');
      const response = await axios.get(`${this.baseUrl}/teams`, {
        headers: this.headers,
        timeout: 10000
      });

      if (response.data && response.data.sports && response.data.sports[0].leagues[0].teams) {
        const teams = response.data.sports[0].leagues[0].teams.map(teamData => {
          const team = teamData.team;
          return {
            id: parseInt(team.id),
            full_name: team.displayName,
            abbreviation: team.abbreviation,
            city: team.location,
            name: team.name,
            conference: this.getConference(team.abbreviation),
            division: this.getDivision(team.abbreviation)
          };
        });
        
        console.log(`   ✅ Found ${teams.length} teams`);
        return teams;
      }
      
      throw new Error('No teams data found');
    } catch (error) {
      console.error('❌ Error fetching teams:', error.message);
      throw error;
    }
  }

  async getTeamRoster(teamAbbreviation) {
    try {
      const espnTeamId = this.teamMapping[teamAbbreviation];
      if (!espnTeamId) {
        throw new Error(`Unknown team abbreviation: ${teamAbbreviation}`);
      }

      console.log(`📋 Fetching roster for ${teamAbbreviation} (ESPN ID: ${espnTeamId})...`);
      
      const response = await axios.get(`${this.baseUrl}/teams/${espnTeamId}/roster`, {
        headers: this.headers,
        timeout: 15000
      });

      if (response.data && response.data.athletes) {
        const players = response.data.athletes.map(athlete => {
          const player = athlete;
          const heightParts = this.parseHeight(player.height);
          
          return {
            id: parseInt(player.id),
            first_name: player.firstName || '',
            last_name: player.lastName || player.displayName,
            position: player.position?.abbreviation || 'G',
            height_feet: heightParts.feet,
            height_inches: heightParts.inches,
            weight_pounds: parseInt(player.weight) || null,
            jersey_number: player.jersey ? parseInt(player.jersey) : null,
            experience: player.experience?.years || 0
          };
        });
        
        console.log(`   ✅ Found ${players.length} players for ${teamAbbreviation}`);
        return players;
      }
      
      throw new Error('No roster data found');
    } catch (error) {
      console.error(`❌ Error fetching ${teamAbbreviation} roster:`, error.message);
      throw error;
    }
  }

  async getAllPlayersFromAllTeams() {
    try {
      console.log('🏀 Fetching all NBA players from team rosters...');
      
      const allPlayers = [];
      const teamAbbreviations = Object.keys(this.teamMapping);
      
      let successCount = 0;
      let totalPlayers = 0;
      
      for (const teamAbbr of teamAbbreviations) {
        try {
          const players = await this.getTeamRoster(teamAbbr);
          
          // Add team info to each player
          const playersWithTeam = players.map(player => ({
            ...player,
            team_abbreviation: teamAbbr,
            espn_team_id: this.teamMapping[teamAbbr]
          }));
          
          allPlayers.push(...playersWithTeam);
          successCount++;
          totalPlayers += players.length;
          
          // Rate limiting - ESPN is pretty lenient but let's be nice
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (teamError) {
          console.log(`   ⚠️  Skipped ${teamAbbr}: ${teamError.message}`);
        }
      }
      
      console.log(`\n🎉 Successfully fetched rosters from ${successCount}/${teamAbbreviations.length} teams`);
      console.log(`   📊 Total players: ${totalPlayers}`);
      
      return allPlayers;
    } catch (error) {
      console.error('❌ Error fetching all players:', error.message);
      throw error;
    }
  }

  async getTodaysGames() {
    try {
      console.log('🏀 Fetching today\'s games from ESPN...');
      
      const response = await axios.get(`${this.baseUrl}/scoreboard`, {
        headers: this.headers,
        timeout: 10000
      });

      if (response.data && response.data.events) {
        const games = response.data.events.map(event => {
          const competition = event.competitions[0];
          const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
          const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
          
          return {
            id: parseInt(event.id),
            date: event.date.split('T')[0],
            season: 2024,
            home_team: {
              id: this.getOurTeamId(homeTeam.team.abbreviation),
              name: homeTeam.team.displayName,
              abbreviation: homeTeam.team.abbreviation
            },
            visitor_team: {
              id: this.getOurTeamId(awayTeam.team.abbreviation),
              name: awayTeam.team.displayName,
              abbreviation: awayTeam.team.abbreviation
            },
            home_team_score: parseInt(homeTeam.score) || 0,
            visitor_team_score: parseInt(awayTeam.score) || 0,
            status: this.parseGameStatus(event.status.type.name),
            period: competition.status?.period || 0,
            time: competition.status?.displayClock || ''
          };
        });
        
        console.log(`   ✅ Found ${games.length} games for today`);
        return games;
      }
      
      throw new Error('No games data found');
    } catch (error) {
      console.error('❌ Error fetching games:', error.message);
      throw error;
    }
  }

  // Helper methods
  parseHeight(heightStr) {
    if (!heightStr || typeof heightStr !== 'string') return { feet: null, inches: null };
    
    // ESPN format is usually "6' 8\"" or "6'8\"" or "6-8"
    const match = heightStr.toString().match(/(\d+)[''-]?\s*(\d+)/);
    if (match) {
      return {
        feet: parseInt(match[1]),
        inches: parseInt(match[2])
      };
    }
    return { feet: null, inches: null };
  }

  parseGameStatus(espnStatus) {
    const status = espnStatus.toLowerCase();
    if (status.includes('final')) return 'final';
    if (status.includes('progress') || status.includes('quarter') || status.includes('half')) return 'in_progress';
    return 'scheduled';
  }

  getConference(abbreviation) {
    const eastern = ['ATL', 'BOS', 'BKN', 'CHA', 'CHI', 'CLE', 'DET', 'IND', 'MIA', 'MIL', 'NYK', 'ORL', 'PHI', 'TOR', 'WAS'];
    return eastern.includes(abbreviation) ? 'Eastern' : 'Western';
  }

  getDivision(abbreviation) {
    const divisions = {
      'ATL': 'Southeast', 'CHA': 'Southeast', 'MIA': 'Southeast', 'ORL': 'Southeast', 'WAS': 'Southeast',
      'BOS': 'Atlantic', 'BKN': 'Atlantic', 'NYK': 'Atlantic', 'PHI': 'Atlantic', 'TOR': 'Atlantic',
      'CHI': 'Central', 'CLE': 'Central', 'DET': 'Central', 'IND': 'Central', 'MIL': 'Central',
      'DEN': 'Northwest', 'MIN': 'Northwest', 'OKC': 'Northwest', 'POR': 'Northwest', 'UTA': 'Northwest',
      'GSW': 'Pacific', 'LAC': 'Pacific', 'LAL': 'Pacific', 'PHX': 'Pacific', 'SAC': 'Pacific',
      'DAL': 'Southwest', 'HOU': 'Southwest', 'MEM': 'Southwest', 'NOP': 'Southwest', 'SAS': 'Southwest'
    };
    return divisions[abbreviation] || 'Unknown';
  }

  getOurTeamId(abbreviation) {
    // Convert ESPN team abbreviation to our database team IDs
    const mapping = {
      'ATL': 1610612737, 'BOS': 1610612738, 'BKN': 1610612751, 'CHA': 1610612766,
      'CHI': 1610612741, 'CLE': 1610612739, 'DAL': 1610612742, 'DEN': 1610612743,
      'DET': 1610612765, 'GSW': 1610612744, 'HOU': 1610612745, 'IND': 1610612754,
      'LAC': 1610612746, 'LAL': 1610612747, 'MEM': 1610612763, 'MIA': 1610612748,
      'MIL': 1610612749, 'MIN': 1610612750, 'NOP': 1610612740, 'NYK': 1610612752,
      'OKC': 1610612760, 'ORL': 1610612753, 'PHI': 1610612755, 'PHX': 1610612756,
      'POR': 1610612757, 'SAC': 1610612758, 'SAS': 1610612759, 'TOR': 1610612761,
      'UTA': 1610612762, 'WAS': 1610612764
    };
    return mapping[abbreviation] || null;
  }
}

module.exports = ESPNNBAService;