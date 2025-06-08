const axios = require('axios');

class NBAApiService {
  constructor() {
    // Using NBA's official stats API endpoints
    this.baseUrl = 'https://stats.nba.com/stats';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://www.nba.com/',
      'Origin': 'https://www.nba.com'
    };
  }

  async getAllTeams() {
    try {
      console.log('Fetching teams from API...');
      const response = await axios.get(`${this.baseUrl}/leagueteams`, {
        params: {
          LeagueID: '00',
          Season: '2024-25'
        },
        headers: this.headers,
        timeout: 10000
      });
      
      const teams = response.data.resultSets[0].rowSet.map(team => ({
        id: team[0],
        full_name: team[2],
        abbreviation: team[3],
        nickname: team[4],
        city: team[5],
        state: team[6],
        year_founded: team[7]
      }));

      const teamsWithConference = teams.map(team => ({
        ...team,
        conference: this.getConference(team.abbreviation),
        division: this.getDivision(team.abbreviation)
      }));

      console.log(`Successfully fetched ${teamsWithConference.length} teams from API`);
      return teamsWithConference;
    } catch (error) {
      console.log('API failed, using fallback team data...');
      return this.getFallbackTeams();
    }
  }

  async getAllPlayersWithTeams() {
    try {
      console.log('Fetching players with team information...');
      
      // Get all team rosters
      const allPlayers = [];
      const teams = await this.getAllTeams();
      
      for (const team of teams.slice(0, 5)) { // Limit to 5 teams for testing to avoid rate limits
        console.log(`Fetching roster for ${team.full_name}...`);
        
        try {
          const response = await axios.get(`${this.baseUrl}/commonteamroster`, {
            params: {
              TeamID: team.id,
              Season: '2024-25'
            },
            headers: this.headers,
            timeout: 10000
          });

          const teamPlayers = response.data.resultSets[0].rowSet.map(player => ({
            id: player[12], // PERSON_ID
            first_name: player[3].split(' ')[0] || player[3],
            last_name: player[3].split(' ').slice(1).join(' ') || '',
            position: player[5],
            height: player[6],
            weight: player[7],
            birth_date: player[8],
            team_id: team.id,
            jersey_number: player[4]
          }));

          allPlayers.push(...teamPlayers);
          console.log(`  - Added ${teamPlayers.length} players from ${team.abbreviation}`);
          
          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (teamError) {
          console.log(`  - Skipping ${team.abbreviation} due to API error`);
        }
      }

      if (allPlayers.length === 0) {
        console.log('No players fetched from API, using fallback data...');
        return this.getFallbackPlayersWithTeams();
      }

      console.log(`Successfully fetched ${allPlayers.length} players with team assignments`);
      return allPlayers;
      
    } catch (error) {
      console.log('Error fetching players, using fallback data...');
      return this.getFallbackPlayersWithTeams();
    }
  }

  async getAllPlayers(page = 1, perPage = 100) {
    // For compatibility with existing code
    const allPlayers = await this.getAllPlayersWithTeams();
    
    // Simulate pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedPlayers = allPlayers.slice(startIndex, endIndex);

    return {
      data: paginatedPlayers,
      meta: {
        current_page: page,
        total_pages: Math.ceil(allPlayers.length / perPage),
        total_count: allPlayers.length
      }
    };
  }

  async getGames(date = null, season = null, page = 1) {
    try {
      const today = date || new Date().toISOString().split('T')[0];
      const formattedDate = today.replace(/-/g, '');
      
      console.log(`Fetching games for ${today}...`);
      
      const response = await axios.get(`${this.baseUrl}/scoreboardV2`, {
        params: {
          GameDate: formattedDate,
          LeagueID: '00',
          DayOffset: '0'
        },
        headers: this.headers,
        timeout: 10000
      });

      const games = response.data.resultSets[0].rowSet.map(game => ({
        id: game[2],
        date: today,
        season: 2024,
        home_team: { id: game[6], name: game[7] },
        visitor_team: { id: game[8], name: game[9] },
        home_team_score: game[21] || 0,
        visitor_team_score: game[22] || 0,
        status: this.getGameStatus(game[3]),
        period: game[4] || 0,
        time: game[10] || ''
      }));

      console.log(`Successfully fetched ${games.length} games`);
      return {
        data: games,
        meta: { current_page: page, total_pages: 1 }
      };
    } catch (error) {
      console.log('Games API failed, using fallback data...');
      return this.getFallbackGames(date);
    }
  }

  async getPlayerStats(gameId, playerId = null) {
    try {
      const response = await axios.get(`${this.baseUrl}/boxscoretraditionalv2`, {
        params: {
          GameID: gameId,
          StartPeriod: 0,
          EndPeriod: 10,
          StartRange: 0,
          EndRange: 28800,
          RangeType: 0
        },
        headers: this.headers,
        timeout: 10000
      });

      const playerStats = response.data.resultSets[0].rowSet.map(stat => ({
        player: { id: stat[4], name: stat[5] },
        team: { id: stat[1] },
        game: { id: gameId },
        min: stat[8],
        pts: stat[26] || 0,
        reb: stat[20] || 0,
        ast: stat[21] || 0,
        stl: stat[22] || 0,
        blk: stat[23] || 0,
        turnover: stat[24] || 0,
        fgm: stat[9] || 0,
        fga: stat[10] || 0,
        fg3m: stat[12] || 0,
        fg3a: stat[13] || 0,
        ftm: stat[15] || 0,
        fta: stat[16] || 0
      }));

      return { data: playerStats };
    } catch (error) {
      console.error('Error fetching player stats:', error.message);
      return { data: [] };
    }
  }

  async getTodaysGames() {
    const today = new Date().toISOString().split('T')[0];
    return this.getGames(today);
  }

  // Helper methods
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

  getGameStatus(statusNum) {
    if (statusNum === 1) return 'scheduled';
    if (statusNum === 2) return 'in_progress';
    if (statusNum === 3) return 'final';
    return 'scheduled';
  }

  parseHeight(heightStr) {
    if (!heightStr) return { feet: null, inches: null };
    const match = heightStr.match(/(\d+)-(\d+)/);
    if (match) {
      return { feet: parseInt(match[1]), inches: parseInt(match[2]) };
    }
    return { feet: null, inches: null };
  }

  // Fallback data with proper team assignments
  getFallbackTeams() {
    return [
      { id: 1610612737, full_name: 'Atlanta Hawks', abbreviation: 'ATL', city: 'Atlanta', conference: 'Eastern', division: 'Southeast' },
      { id: 1610612738, full_name: 'Boston Celtics', abbreviation: 'BOS', city: 'Boston', conference: 'Eastern', division: 'Atlantic' },
      { id: 1610612751, full_name: 'Brooklyn Nets', abbreviation: 'BKN', city: 'Brooklyn', conference: 'Eastern', division: 'Atlantic' },
      { id: 1610612766, full_name: 'Charlotte Hornets', abbreviation: 'CHA', city: 'Charlotte', conference: 'Eastern', division: 'Southeast' },
      { id: 1610612741, full_name: 'Chicago Bulls', abbreviation: 'CHI', city: 'Chicago', conference: 'Eastern', division: 'Central' },
      { id: 1610612739, full_name: 'Cleveland Cavaliers', abbreviation: 'CLE', city: 'Cleveland', conference: 'Eastern', division: 'Central' },
      { id: 1610612742, full_name: 'Dallas Mavericks', abbreviation: 'DAL', city: 'Dallas', conference: 'Western', division: 'Southwest' },
      { id: 1610612743, full_name: 'Denver Nuggets', abbreviation: 'DEN', city: 'Denver', conference: 'Western', division: 'Northwest' },
      { id: 1610612765, full_name: 'Detroit Pistons', abbreviation: 'DET', city: 'Detroit', conference: 'Eastern', division: 'Central' },
      { id: 1610612744, full_name: 'Golden State Warriors', abbreviation: 'GSW', city: 'Golden State', conference: 'Western', division: 'Pacific' },
      { id: 1610612745, full_name: 'Houston Rockets', abbreviation: 'HOU', city: 'Houston', conference: 'Western', division: 'Southwest' },
      { id: 1610612754, full_name: 'Indiana Pacers', abbreviation: 'IND', city: 'Indiana', conference: 'Eastern', division: 'Central' },
      { id: 1610612746, full_name: 'LA Clippers', abbreviation: 'LAC', city: 'Los Angeles', conference: 'Western', division: 'Pacific' },
      { id: 1610612747, full_name: 'Los Angeles Lakers', abbreviation: 'LAL', city: 'Los Angeles', conference: 'Western', division: 'Pacific' },
      { id: 1610612763, full_name: 'Memphis Grizzlies', abbreviation: 'MEM', city: 'Memphis', conference: 'Western', division: 'Southwest' },
      { id: 1610612748, full_name: 'Miami Heat', abbreviation: 'MIA', city: 'Miami', conference: 'Eastern', division: 'Southeast' },
      { id: 1610612749, full_name: 'Milwaukee Bucks', abbreviation: 'MIL', city: 'Milwaukee', conference: 'Eastern', division: 'Central' },
      { id: 1610612750, full_name: 'Minnesota Timberwolves', abbreviation: 'MIN', city: 'Minnesota', conference: 'Western', division: 'Northwest' },
      { id: 1610612740, full_name: 'New Orleans Pelicans', abbreviation: 'NOP', city: 'New Orleans', conference: 'Western', division: 'Southwest' },
      { id: 1610612752, full_name: 'New York Knicks', abbreviation: 'NYK', city: 'New York', conference: 'Eastern', division: 'Atlantic' },
      { id: 1610612760, full_name: 'Oklahoma City Thunder', abbreviation: 'OKC', city: 'Oklahoma City', conference: 'Western', division: 'Northwest' },
      { id: 1610612753, full_name: 'Orlando Magic', abbreviation: 'ORL', city: 'Orlando', conference: 'Eastern', division: 'Southeast' },
      { id: 1610612755, full_name: 'Philadelphia 76ers', abbreviation: 'PHI', city: 'Philadelphia', conference: 'Eastern', division: 'Atlantic' },
      { id: 1610612756, full_name: 'Phoenix Suns', abbreviation: 'PHX', city: 'Phoenix', conference: 'Western', division: 'Pacific' },
      { id: 1610612757, full_name: 'Portland Trail Blazers', abbreviation: 'POR', city: 'Portland', conference: 'Western', division: 'Northwest' },
      { id: 1610612758, full_name: 'Sacramento Kings', abbreviation: 'SAC', city: 'Sacramento', conference: 'Western', division: 'Pacific' },
      { id: 1610612759, full_name: 'San Antonio Spurs', abbreviation: 'SAS', city: 'San Antonio', conference: 'Western', division: 'Southwest' },
      { id: 1610612761, full_name: 'Toronto Raptors', abbreviation: 'TOR', city: 'Toronto', conference: 'Eastern', division: 'Atlantic' },
      { id: 1610612762, full_name: 'Utah Jazz', abbreviation: 'UTA', city: 'Utah', conference: 'Western', division: 'Northwest' },
      { id: 1610612764, full_name: 'Washington Wizards', abbreviation: 'WAS', city: 'Washington', conference: 'Eastern', division: 'Southeast' }
    ];
  }

  getFallbackPlayersWithTeams() {
    return [
      // Lakers (1610612747)
      { id: 2544, first_name: 'LeBron', last_name: 'James', position: 'F', height_feet: 6, height_inches: 9, weight_pounds: 250, team_id: 1610612747 },
      { id: 203076, first_name: 'Anthony', last_name: 'Davis', position: 'F-C', height_feet: 6, height_inches: 10, weight_pounds: 253, team_id: 1610612747 },
      { id: 201566, first_name: 'Russell', last_name: 'Westbrook', position: 'G', height_feet: 6, height_inches: 3, weight_pounds: 200, team_id: 1610612747 },
      
      // Warriors (1610612744)
      { id: 201939, first_name: 'Stephen', last_name: 'Curry', position: 'G', height_feet: 6, height_inches: 2, weight_pounds: 185, team_id: 1610612744 },
      { id: 202691, first_name: 'Klay', last_name: 'Thompson', position: 'G', height_feet: 6, height_inches: 6, weight_pounds: 220, team_id: 1610612744 },
      { id: 203110, first_name: 'Draymond', last_name: 'Green', position: 'F', height_feet: 6, height_inches: 6, weight_pounds: 230, team_id: 1610612744 },
      
      // Pistons (1610612765)
      { id: 1630595, first_name: 'Cade', last_name: 'Cunningham', position: 'G', height_feet: 6, height_inches: 8, weight_pounds: 220, team_id: 1610612765 },
      { id: 1630533, first_name: 'Isaiah', last_name: 'Stewart', position: 'F-C', height_feet: 6, height_inches: 8, weight_pounds: 250, team_id: 1610612765 },
      { id: 1629636, first_name: 'Saddiq', last_name: 'Bey', position: 'F', height_feet: 6, height_inches: 7, weight_pounds: 215, team_id: 1610612765 },
      
      // Celtics (1610612738)
      { id: 203935, first_name: 'Jayson', last_name: 'Tatum', position: 'F', height_feet: 6, height_inches: 8, weight_pounds: 210, team_id: 1610612738 },
      { id: 1627759, first_name: 'Jaylen', last_name: 'Brown', position: 'G-F', height_feet: 6, height_inches: 6, weight_pounds: 223, team_id: 1610612738 },
      { id: 203484, first_name: 'Marcus', last_name: 'Smart', position: 'G', height_feet: 6, height_inches: 4, weight_pounds: 220, team_id: 1610612738 },
      
      // Nets (1610612751)
      { id: 201142, first_name: 'Kevin', last_name: 'Durant', position: 'F', height_feet: 6, height_inches: 10, weight_pounds: 240, team_id: 1610612751 },
      { id: 201933, first_name: 'Kyrie', last_name: 'Irving', position: 'G', height_feet: 6, height_inches: 2, weight_pounds: 195, team_id: 1610612751 },
      { id: 203932, first_name: 'Ben', last_name: 'Simmons', position: 'G-F', height_feet: 6, height_inches: 10, weight_pounds: 240, team_id: 1610612751 }
    ];
  }

  getFallbackGames(date) {
    const today = date || new Date().toISOString().split('T')[0];
    return {
      data: [
        {
          id: 22400001,
          date: today,
          season: 2024,
          home_team: { id: 1610612747, name: 'Los Angeles Lakers' },
          visitor_team: { id: 1610612744, name: 'Golden State Warriors' },
          home_team_score: 0,
          visitor_team_score: 0,
          status: 'scheduled',
          period: 0,
          time: '8:00 PM ET'
        }
      ],
      meta: { current_page: 1, total_pages: 1 }
    };
  }
}

module.exports = new NBAApiService();