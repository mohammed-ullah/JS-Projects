const sequelize = require('../config/database');
const { Team, Player, Game, PlayerStats } = require('../models');

async function setupDatabase() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('Database connection successful!');

    console.log('Creating tables...');
    await sequelize.sync({ force: false }); // Set to true to recreate tables
    console.log('Tables created successfully!');

    console.log('Database setup complete!');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();