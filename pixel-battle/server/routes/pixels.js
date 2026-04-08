import express from 'express';
import Pixel from '../models/Pixel.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Board size configuration
const BOARD_SIZE = 100; // 100x100 pixels
const COOLDOWN_TIME = 5000; // 5 seconds between pixel placements

// @route   GET /api/pixels/board
// @desc    Get the entire board state
// @access  Public
router.get('/board', async (req, res) => {
  try {
    const pixels = await Pixel.find({
      x: { $gte: 0, $lt: BOARD_SIZE },
      y: { $gte: 0, $lt: BOARD_SIZE }
    });

    // Convert to map for easier frontend consumption
    const boardMap = {};
    pixels.forEach(pixel => {
      boardMap[`${pixel.x},${pixel.y}`] = {
        color: pixel.color,
        placedBy: pixel.placedBy,
        placedAt: pixel.placedAt
      };
    });

    res.json({
      boardSize: BOARD_SIZE,
      pixels: boardMap,
      totalPixels: pixels.length
    });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/pixels/place
// @desc    Place a pixel on the board
// @access  Private
router.put('/place', protect, async (req, res) => {
  try {
    const { x, y, color } = req.body;

    // Validation
    if (x === undefined || y === undefined || !color) {
      return res.status(400).json({ message: 'Please provide x, y, and color' });
    }

    // Check bounds
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) {
      return res.status(400).json({ message: 'Coordinates out of bounds' });
    }

    // Validate color format
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return res.status(400).json({ message: 'Invalid color format' });
    }

    // Check cooldown (optional - can be enhanced with Redis for production)
    const lastPixel = await Pixel.findOne({ placedBy: req.user._id })
      .sort({ placedAt: -1 });
    
    if (lastPixel) {
      const timeSinceLastPlacement = Date.now() - new Date(lastPixel.placedAt).getTime();
      if (timeSinceLastPlacement < COOLDOWN_TIME && req.user.role !== 'admin') {
        const waitTime = Math.ceil((COOLDOWN_TIME - timeSinceLastPlacement) / 1000);
        return res.status(429).json({ 
          message: `Please wait ${waitTime} seconds before placing another pixel`,
          cooldown: waitTime
        });
      }
    }

    // Update or create pixel
    const pixel = await Pixel.findOneAndUpdate(
      { x, y },
      {
        x,
        y,
        color,
        placedBy: req.user._id,
        placedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { pixelsPlaced: 1 }
    });

    // Emit socket event (will be handled by the main app)
    const io = req.app.get('io');
    if (io) {
      io.to('game-room').emit('pixel-updated', {
        x,
        y,
        color,
        placedBy: req.user.username
      });
    }

    res.json({
      message: 'Pixel placed successfully',
      pixel: {
        x: pixel.x,
        y: pixel.y,
        color: pixel.color,
        placedBy: req.user.username
      }
    });
  } catch (error) {
    console.error('Place pixel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/pixels/leaderboard
// @desc    Get top players by pixels placed
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await User.find()
      .select('username pixelsPlaced role')
      .sort({ pixelsPlaced: -1 })
      .limit(10);

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/pixels/activity
// @desc    Get recent pixel activity
// @access  Public
router.get('/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const activity = await Pixel.find()
      .populate('placedBy', 'username')
      .sort({ placedAt: -1 })
      .limit(limit)
      .select('x y color placedAt placedBy');

    res.json(activity);
  } catch (error) {
    console.error('Activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
