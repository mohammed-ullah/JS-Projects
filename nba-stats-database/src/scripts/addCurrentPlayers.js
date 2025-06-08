const axios = require('axios');
const { Player, Team } = require('../models');

async function addCurrentNBAPlayers() {
  console.log('🏀 Adding current NBA players (2024-25 season)...\n');
  
  try {
    // Clear existing players
    await Player.destroy({ where: {} });
    
    // Current NBA rosters (manually curated for accuracy)
    const currentPlayers = [
      // Detroit Pistons (1610612765)
      { id: 1630595, first_name: 'Cade', last_name: 'Cunningham', position: 'G', height_feet: 6, height_inches: 8, weight_pounds: 220, team_id: 1610612765 },
      { id: 1630533, first_name: 'Isaiah', last_name: 'Stewart', position: 'F-C', height_feet: 6, height_inches: 8, weight_pounds: 250, team_id: 1610612765 },
      { id: 1630203, first_name: 'Jalen', last_name: 'Duren', position: 'C', height_feet: 6, height_inches: 11, weight_pounds: 250, team_id: 1610612765 },
      { id: 1641705, first_name: 'Ausar', last_name: 'Thompson', position: 'G-F', height_feet: 6, height_inches: 7, weight_pounds: 205, team_id: 1610612765 },
      { id: 1641720, first_name: 'Marcus', last_name: 'Sasser', position: 'G', height_feet: 6, height_inches: 2, weight_pounds: 195, team_id: 1610612765 },
      { id: 203648, first_name: 'Tobias', last_name: 'Harris', position: 'F', height_feet: 6, height_inches: 7, weight_pounds: 226, team_id: 1610612765 },
      { id: 1629018, first_name: 'Tim', last_name: 'Hardaway Jr.', position: 'G-F', height_feet: 6, height_inches: 5, weight_pounds: 205, team_id: 1610612765 },
      
      // Los Angeles Lakers (1610612747)
      { id: 2544, first_name: 'LeBron', last_name: 'James', position: 'F', height_feet: 6, height_inches: 9, weight_pounds: 250, team_id: 1610612747 },
      { id: 203076, first_name: 'Anthony', last_name: 'Davis', position: 'F-C', height_feet: 6, height_inches: 10, weight_pounds: 253, team_id: 1610612747 },
      { id: 1629627, first_name: 'Austin', last_name: 'Reaves', position: 'G', height_feet: 6, height_inches: 5, weight_pounds: 197, team_id: 1610612747 },
      { id: 203999, first_name: 'D\'Angelo', last_name: 'Russell', position: 'G', height_feet: 6, height_inches: 4, weight_pounds: 193, team_id: 1610612747 },
      { id: 1628398, first_name: 'Rui', last_name: 'Hachimura', position: 'F', height_feet: 6, height_inches: 8, weight_pounds: 230, team_id: 1610612747 },
      { id: 1641734, first_name: 'Dalton', last_name: 'Knecht', position: 'G-F', height_feet: 6, height_inches: 6, weight_pounds: 213, team_id: 1610612747 },
      
      // Golden State Warriors (1610612744)
      { id: 201939, first_name: 'Stephen', last_name: 'Curry', position: 'G', height_feet: 6, height_inches: 2, weight_pounds: 185, team_id: 1610612744 },
      { id: 203110, first_name: 'Draymond', last_name: 'Green', position: 'F', height_feet: 6, height_inches: 6, weight_pounds: 230, team_id: 1610612744 },
      { id: 1630193, first_name: 'Jonathan', last_name: 'Kuminga', position: 'F', height_feet: 6, height_inches: 7, weight_pounds: 210, team_id: 1610612744 },
      { id: 203105, first_name: 'Andrew', last_name: 'Wiggins', position: 'F', height_feet: 6, height_inches: 7, weight_pounds: 197, team_id: 1610612744 },
      { id: 1630224, first_name: 'Moses', last_name: 'Moody', position: 'G-F', height_feet: 6, height_inches: 6, weight_pounds: 211, team_id: 1610612744 },
      { id: 1630851, first_name: 'Brandin', last_name: 'Podziemski', position: 'G', height_feet: 6, height_inches: 5, weight_pounds: 205, team_id: 1610612744 },
      
      // Boston Celtics (1610612738)
      { id: 203935, first_name: 'Jayson', last_name: 'Tatum', position: 'F', height_feet: 6, height_inches: 8, weight_pounds: 210, team_id: 1610612738 },
      { id: 1627759, first_name: 'Jaylen', last_name: 'Brown', position: 'G-F', height_feet: 6, height_inches: 6, weight_pounds: 223, team_id: 1610612738 },
      { id: 1628369, first_name: 'Derrick', last_name: 'White', position: 'G', height_feet: 6, height_inches: 4, weight_pounds: 190, team_id: 1610612738 },
      { id: 1629684, first_name: 'Payton', last_name: 'Pritchard', position: 'G', height_feet: 6, height_inches: 1, weight_pounds: 195, team_id: 1610612738 },
      { id: 203463, first_name: 'Kristaps', last_name: 'Porzingis', position: 'F-C', height_feet: 7, height_inches: 2, weight_pounds: 240, team_id: 1610612738 },
      { id: 1628400, first_name: 'Jrue', last_name: 'Holiday', position: 'G', height_feet: 6, height_inches: 3, weight_pounds: 205, team_id: 1610612738 },
      
      // Phoenix Suns (1610612756)
      { id: 1629630, first_name: 'Devin', last_name: 'Booker', position: 'G', height_feet: 6, height_inches: 5, weight_pounds: 206, team_id: 1610612756 },
      { id: 201142, first_name: 'Kevin', last_name: 'Durant', position: 'F', height_feet: 6, height_inches: 10, weight_pounds: 240, team_id: 1610612756 },
      { id: 203901, first_name: 'Bradley', last_name: 'Beal', position: 'G', height_feet: 6, height_inches: 4, weight_pounds: 207, team_id: 1610612756 },
      { id: 1630567, first_name: 'Ryan', last_name: 'Dunn', position: 'F', height_feet: 6, height_inches: 8, weight_pounds: 213, team_id: 1610612756 },
      { id: 203991, first_name: 'Jusuf', last_name: 'Nurkic', position: 'C', height_feet: 7, height_inches: 0, weight_pounds: 290, team_id: 1610612756 },
      
      // Miami Heat (1610612748)
      { id: 200755, first_name: 'Jimmy', last_name: 'Butler', position: 'F', height_feet: 6, height_inches: 7, weight_pounds: 230, team_id: 1610612748 },
      { id: 1628389, first_name: 'Bam', last_name: 'Adebayo', position: 'C', height_feet: 6, height_inches: 9, weight_pounds: 255, team_id: 1610612748 },
      { id: 1629750, first_name: 'Tyler', last_name: 'Herro', position: 'G', height_feet: 6, height_inches: 5, weight_pounds: 195, team_id: 1610612748 },
      { id: 203937, first_name: 'Terry', last_name: 'Rozier', position: 'G', height_feet: 6, height_inches: 2, weight_pounds: 190, team_id: 1610612748 },
      { id: 1627823, first_name: 'Duncan', last_name: 'Robinson', position: 'F', height_feet: 6, height_inches: 7, weight_pounds: 215, team_id: 1610612748 },
      
      // Milwaukee Bucks (1610612749)
      { id: 203507, first_name: 'Giannis', last_name: 'Antetokounmpo', position: 'F', height_feet: 6, height_inches: 11, weight_pounds: 243, team_id: 1610612749 },
      { id: 201572, first_name: 'Damian', last_name: 'Lillard', position: 'G', height_feet: 6, height_inches: 2, weight_pounds: 195, team_id: 1610612749 },
      { id: 200826, first_name: 'Khris', last_name: 'Middleton', position: 'F', height_feet: 6, height_inches: 7, weight_pounds: 222, team_id: 1610612749 },
      { id: 204001, first_name: 'Brook', last_name: 'Lopez', position: 'C', height_feet: 7, height_inches: 0, weight_pounds: 282, team_id: 1610612749 },
      { id: 1628425, first_name: 'Bobby', last_name: 'Portis', position: 'F', height_feet: 6, height_inches: 10, weight_pounds: 250, team_id: 1610612749 },
      
      // New York Knicks (1610612752)
      { id: 1628374, first_name: 'Jalen', last_name: 'Brunson', position: 'G', height_feet: 6, height_inches: 2, weight_pounds: 190, team_id: 1610612752 },
      { id: 1628404, first_name: 'Julius', last_name: 'Randle', position: 'F', height_feet: 6, height_inches: 8, weight_pounds: 250, team_id: 1610612752 },
      { id: 1629628, first_name: 'RJ', last_name: 'Barrett', position: 'G-F', height_feet: 6, height_inches: 6, weight_pounds: 214, team_id: 1610612752 },
      { id: 1630173, first_name: 'Immanuel', last_name: 'Quickley', position: 'G', height_feet: 6, height_inches: 3, weight_pounds: 190, team_id: 1610612752 },
      { id: 203500, first_name: 'Mitchell', last_name: 'Robinson', position: 'C', height_feet: 7, height_inches: 0, weight_pounds: 240, team_id: 1610612752 },
      
      // Dallas Mavericks (1610612742)
      { id: 1629029, first_name: 'Luka', last_name: 'Doncic', position: 'G-F', height_feet: 6, height_inches: 7, weight_pounds: 230, team_id: 1610612742 },
      { id: 201933, first_name: 'Kyrie', last_name: 'Irving', position: 'G', height_feet: 6, height_inches: 2, weight_pounds: 195, team_id: 1610612742 },
      { id: 1629626, first_name: 'Daniel', last_name: 'Gafford', position: 'C', height_feet: 6, height_inches: 10, weight_pounds: 234, team_id: 1610612742 },
      { id: 203460, first_name: 'P.J.', last_name: 'Washington', position: 'F', height_feet: 6, height_inches: 7, weight_pounds: 230, team_id: 1610612742 },
      { id: 1628470, first_name: 'Dereck', last_name: 'Lively II', position: 'C', height_feet: 7, height_inches: 1, weight_pounds: 230, team_id: 1610612742 }
    ];
    
    // Add all players
    let playersAdded = 0;
    for (const playerData of currentPlayers) {
      try {
        await Player.create(playerData);
        playersAdded++;
      } catch (error) {
        console.log(`   ⚠️  Skipped ${playerData.first_name} ${playerData.last_name}: ${error.message}`);
      }
    }
    
    console.log(`✅ Successfully added ${playersAdded} current NBA players!\n`);
    
    // Show summary by team
    const teamCounts = {};
    for (const player of currentPlayers) {
      const team = await Team.findByPk(player.team_id);
      if (team) {
        teamCounts[team.abbreviation] = (teamCounts[team.abbreviation] || 0) + 1;
      }
    }
    
    console.log('📊 Players added by team:');
    Object.entries(teamCounts).forEach(([abbr, count]) => {
      console.log(`   ${abbr}: ${count} players`);
    });
    
    console.log(`\n🎉 Update complete! You now have current NBA rosters.`);
    console.log(`   Total players in database: ${playersAdded}`);
    
  } catch (error) {
    console.error('❌ Error adding players:', error.message);
  }
}

module.exports = { addCurrentNBAPlayers };

// Run if called directly
if (require.main === module) {
  addCurrentNBAPlayers().then(() => {
    console.log('\nReady to query! Try your Pistons query now.');
    process.exit(0);
  });
}