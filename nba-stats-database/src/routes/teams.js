const express = require('express');
const { Team, Player } = require('../models');
const router = express.Router();

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.findAll({
      order: [['name', 'ASC']]
    });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get team by ID with players
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id, {
      include: [{
        model: Player,
        attributes: ['id', 'first_name', 'last_name', 'position']
      }]
    });
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get teams by conference
router.get('/conference/:conference', async (req, res) => {
  try {
    const teams = await Team.findAll({
      where: { conference: req.params.conference },
      order: [['name', 'ASC']]
    });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;