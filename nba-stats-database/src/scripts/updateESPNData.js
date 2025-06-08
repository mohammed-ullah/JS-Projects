const ESPNNBAService = require('../services/ESPNNBAService');
const { Team, Player, Game } = require('../models');

async function updateWithESPNData() {
  console.log('🏀 Starting ESPN NBA data update...\n');
  
  const espnService = new ESPNNBAService();
  
  try {
    // Step 1: Update Teams (optional, you probably already have them)
    console.log('1️⃣ Updating teams...');
    try {
      const teams = await espnService.getAllTeams();
      
      for (const teamData of teams) {
        await Team.upsert({
          id: espnService.getOurTeamId(teamData.abbreviation),
          name: teamData.full_name,
          abbreviation: teamData.abbreviation,
          city: teamData.city,
          conference: teamData.conference,
          division: teamData.division
        });
      }
      
      console.log(`   ✅ Updated ${teams.length} teams\n`);
    } catch (teamError) {
      console.log(`   ⚠️  Team update failed, using existing teams\n`);
    }

    // Step 2: Update Players with Current Rosters
    console.log('2️⃣ Updating players from ESPN rosters...');
    
    // Clear existing players
    await Player.destroy({ where: {} });
    
    const allPlayers = await espnService.getAllPlayersFromAllTeams();
    
    let playersAdded = 0;
    for (const playerData of allPlayers) {
      try {
        await Player.create({
          id: playerData.id,
          first_name: playerData.first_name,
          last_name: playerData.last_name,
          position: playerData.position,
          height_feet: playerData.height_feet,
          height_inches: playerData.height_inches,
          weight_pounds: playerData.weight_pounds,
          team_id: espnService.getOurTeamId(playerData.team_abbreviation)
        });
        playersAdded++;
      } catch (playerError) {
        console.log(`   ⚠️  Skipped player ${playerData.first_name} ${playerData.last_name}: ${playerError.message}`);
      }
    }
    
    console.log(`   ✅ Added ${playersAdded} players with current team assignments\n`);

    // Step 3: Update Today's Games
    console.log('3️⃣ Updating today\'s games...');
    try {
      const games = await espnService.getTodaysGames();
      
      for (const gameData of games) {
        await Game.upsert({
          id: gameData.id,
          date: gameData.date,
          season: gameData.season,
          home_team_id: gameData.home_team.id,
          visitor_team_id: gameData.visitor_team.id,
          home_team_score: gameData.home_team_score,
          visitor_team_score: gameData.visitor_team_score,
          status: gameData.status,
          period: gameData.period,
          time: gameData.time
        });
      }
      
      console.log(`   ✅ Updated ${games.length} games for today\n`);
    } catch (gameError) {
      console.log(`   ⚠️  Games update failed: ${gameError.message}\n`);
    }

    // Step 4: Show Summary
    console.log('📊 Update Summary:');
    
    const teamCounts = await Team.findAll({
      attributes: ['abbreviation', 'name'],
      include: [{
        model: Player,
        attributes: [],
        required: false
      }],
      group: ['Team.id', 'Team.abbreviation', 'Team.name'],
      order: [['abbreviation', 'ASC']]
    });

    console.log('\nPlayers by team:');
    for (const team of teamCounts) {
      const playerCount = await Player.count({ where: { team_id: espnService.getOurTeamId(team.abbreviation) } });
      console.log(`   ${team.abbreviation}: ${playerCount} players`);
    }

    const totalPlayers = await Player.count();
    const totalGames = await Game.count();
    
    console.log(`\n🎉 Update Complete!`);
    console.log(`   📊 Total players in database: ${totalPlayers}`);
    console.log(`   🏀 Total games in database: ${totalGames}`);
    console.log('\n✅ You can now query current NBA rosters!');
    
  } catch (error) {
    console.error('❌ ESPN update failed:', error.message);
  }
}

module.exports = { updateWithESPNData };

// Run if called directly
if (require.main === module) {
  updateWithESPNData().then(() => {
    console.log('\nDone! Test your queries now.');
    process.exit(0);
  });
}