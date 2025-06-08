const cron = require('node-cron');
const dataUpdater = require('../services/dataUpdater');

class UpdateScheduler {
  start() {
    console.log('Starting NBA data update scheduler...');

    // Update teams daily at 6 AM
    cron.schedule('0 6 * * *', async () => {
      console.log('Running daily team update...');
      await dataUpdater.updateTeams();
    });

    // Update players daily at 6:30 AM
    cron.schedule('30 6 * * *', async () => {
      console.log('Running daily player update...');
      await dataUpdater.updatePlayers();
    });

    // Update today's games every 30 minutes during basketball season
    cron.schedule('*/30 * * * *', async () => {
      console.log('Running games update...');
      const games = await dataUpdater.updateTodaysGames();
      
      // Update stats for completed games
      if (games) {
        for (const game of games) {
          if (game.status === 'final') {
            await dataUpdater.updateGameStats(game.id);
            // Add delay between requests
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
    });

    console.log('Scheduler started successfully!');
  }

  stop() {
    console.log('Stopping scheduler...');
    cron.getTasks().forEach(task => task.stop());
  }
}

module.exports = new UpdateScheduler();