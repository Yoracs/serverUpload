import Pixel from '../models/Pixel.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const BOARD_SIZE = 100;

export const initializeGameBoard = async () => {
  try {
    // Check if board already has pixels
    const pixelCount = await Pixel.countDocuments();
    
    if (pixelCount === 0) {
      console.log('🎨 Initializing empty game board...');
      
      // Create admin user if not exists
      const adminExists = await User.findOne({ role: 'admin' });
      if (!adminExists && process.env.ADMIN_EMAIL) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', salt);
        
        await User.create({
          username: 'Admin',
          email: process.env.ADMIN_EMAIL,
          password: hashedPassword,
          role: 'admin'
        });
        
        console.log('✓ Admin user created');
      }
      
      console.log('✓ Game board ready');
    } else {
      console.log(`✓ Game board loaded with ${pixelCount} pixels`);
    }
  } catch (error) {
    console.error('✗ Error initializing game board:', error.message);
  }
};

export const getBoardStats = async () => {
  const totalPixels = await Pixel.countDocuments();
  const uniqueColors = await Pixel.distinct('color');
  const activeUsers = await User.countDocuments({ pixelsPlaced: { $gt: 0 } });
  
  return {
    totalPixels,
    totalColors: uniqueColors.length,
    activeUsers,
    boardSize: BOARD_SIZE,
    coverage: ((totalPixels / (BOARD_SIZE * BOARD_SIZE)) * 100).toFixed(2) + '%'
  };
};
