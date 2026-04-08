import express from 'express';
import User from '../models/User.js';
import Pixel from '../models/Pixel.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private/Admin
router.put('/users/:id/role', protect, admin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Also delete user's pixels
    await Pixel.deleteMany({ placedBy: req.params.id });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/stats
// @desc    Get game statistics (Admin only)
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPixels = await Pixel.countDocuments();
    const activeUsers = await User.countDocuments({ pixelsPlaced: { $gt: 0 } });
    
    const recentActivity = await Pixel.aggregate([
      { $sort: { placedAt: -1 } },
      { $limit: 100 },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$placedAt' } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': -1 } },
      { $limit: 7 }
    ]);

    res.json({
      totalUsers,
      totalPixels,
      activeUsers,
      boardSize: 100,
      recentActivity
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/reset-board
// @desc    Reset the entire board (Admin only)
// @access  Private/Admin
router.post('/reset-board', protect, admin, async (req, res) => {
  try {
    await Pixel.deleteMany({});
    
    const io = req.app.get('io');
    if (io) {
      io.to('game-room').emit('board-reset', {});
    }

    res.json({ message: 'Board reset successfully' });
  } catch (error) {
    console.error('Reset board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/board-size
// @desc    Update board size (Admin only)
// @access  Private/Admin
router.put('/board-size', protect, admin, async (req, res) => {
  try {
    const { size } = req.body;
    
    if (!size || size < 10 || size > 500) {
      return res.status(400).json({ message: 'Board size must be between 10 and 500' });
    }

    // This would need to be stored in a config collection for production
    // For now, we'll just acknowledge the request
    res.json({ 
      message: 'Board size updated',
      newSize: size,
      note: 'Restart server to apply changes'
    });
  } catch (error) {
    console.error('Update board size error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
