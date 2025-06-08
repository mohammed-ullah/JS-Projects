const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const teamsRouter = require('./routes/teams');
const playersRouter = require('./routes/players');
const gamesRouter = require('./routes/games');
const updateScheduler = require('./scheduler/updateScheduler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/teams', teamsRouter);
app.use('/api/players', playersRouter);
app.use('/api/games', gamesRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    name: 'NBA Stats Database API',
    version: '1.0.0',
    endpoints: {
      teams: '/api/teams',
      players: '/api/players',
      games: '/api/games',
      health: '/health'
    }
  });
});

// Start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    app.listen(PORT, () => {
      console.log(`🏀 NBA Stats API server running on port ${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
      
      // Start the update scheduler
      updateScheduler.start();
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Graceful shutdown...');
  updateScheduler.stop();
  process.exit(0);
});