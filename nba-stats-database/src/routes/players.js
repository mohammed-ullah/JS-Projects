const express = require('express');
const { Player, Team, PlayerStats } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// Get all players with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search;

    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const players = await Player.findAndCountAll({
      where: whereClause,
      include: [{
        model: Team,
        attributes: ['name', 'abbreviation', 'city']
      }],
      limit,
      offset,
      order: [['last_name', 'ASC'], ['first_name', 'ASC']]
    });

    res.json({
      players: players.rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(players.count / limit),
        totalPlayers: players.count,
        hasNextPage: page * limit < players.count,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get player by ID with recent stats
router.get('/:id', async (req, res) => {
  try {
    const player = await Player.findByPk(req.params.id, {
      include: [
        {
          model: Team,
          attributes: ['name', 'abbreviation', 'city']
        },
        {
          model: PlayerStats,
          limit: 10,
          order: [['created_at', 'DESC']],
          include: [{
            model: Game,
            attributes: ['date', 'home_team_id', 'visitor_team_id']
          }]
        }
      ]
    });
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;