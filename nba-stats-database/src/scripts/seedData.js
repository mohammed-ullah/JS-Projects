const dataUpdater = require('../services/dataUpdater');

async function seedData() {
  try {
    console.log('Starting data seeding...');
    
    console.log('Seeding teams...');
    await dataUpdater.updateTeams();
    
    console.log('Seeding players (this may take a while)...');
    await dataUpdater.updatePlayers();
    
    console.log('Seeding today\'s games...');
    await dataUpdater.updateTodaysGames();
    
    console.log('Data seeding complete!');
  } catch (error) {
    console.error('Data seeding failed:', error);
    process.exit(1);
  }
}

seedData();