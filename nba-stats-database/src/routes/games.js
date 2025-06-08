const express = require('express');
const { Game, Team, PlayerStats, Player } = require('../models');
const router = express.Router();

// Get games by date
router.get('/date/:date', async (req, res) => {
  try {
    const games = await Game.findAll({
      where: { date: req.params.date },
      include: [
        { model: Team, as: 'HomeTeam', attributes: ['name', 'abbreviation'] },
        { model: Team, as: 'VisitorTeam', attributes: ['name', 'abbreviation'] }
      ],
      order: [['date', 'ASC']]
    });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get today's games
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const games = await Game.findAll({
      where: { date: today },
      include: [
        { model: Team, as: 'HomeTeam', attributes: ['name', 'abbreviation'] },
        { model: Team, as: 'VisitorTeam', attributes: ['name', 'abbreviation'] }
      ],
      order: [['date', 'ASC']]
    });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get game stats
router.get('/:id/stats', async (req, res) => {
  try {
    const gameStats = await PlayerStats.findAll({
      where: { game_id: req.params.id },
      include: [
        {
          model: Player,
          attributes: ['first_name', 'last_name', 'position']
        },
        {
          model: Team,
          attributes: ['name', 'abbreviation']
        }
      ],
      order: [['points', 'DESC']]
    });
    res.json(gameStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;