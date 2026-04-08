import { useState, useEffect } from 'react';
import PixelBoard from '../components/PixelBoard';
import ColorPicker from '../components/ColorPicker';
import Leaderboard from '../components/Leaderboard';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useGameBoard } from '../hooks/useGameBoard';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { socket, on } = useSocket();
  const { 
    boardSize, 
    pixels, 
    loading, 
    cooldown, 
    loadBoard, 
    placePixel, 
    updatePixel,
    clearBoard 
  } = useGameBoard();
  
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Listen for real-time updates
    if (socket) {
      const unsubscribePixelUpdate = on('pixel-updated', (data) => {
        updatePixel(data.x, data.y, data.color, data.placedBy);
        showNotification(`${data.placedBy} placed a pixel!`, 'info');
      });

      const unsubscribeBoardReset = on('board-reset', () => {
        clearBoard();
        showNotification('Board has been reset by admin!', 'warning');
      });

      return () => {
        unsubscribePixelUpdate();
        unsubscribeBoardReset();
      };
    }
  }, [socket, on, updatePixel, clearBoard]);

  const handlePixelClick = async (x, y, color) => {
    if (!isAuthenticated) {
      showNotification('Please login to place pixels!', 'error');
      return;
    }

    try {
      await placePixel(x, y, color);
      showNotification('Pixel placed successfully!', 'success');
      
      // Emit socket event
      if (socket) {
        socket.emit('pixel-update', { x, y, color });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to place pixel';
      showNotification(message, 'error');
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading game board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="game-container container">
        <div className="game-header">
          <h1 className="game-title">
            <span className="text-gradient">Pixel Battle</span> Arena
          </h1>
          <p className="game-subtitle">
            Create art together! Place pixels on the {boardSize}x{boardSize} board.
          </p>
          
          {!isAuthenticated && (
            <div className="login-prompt">
              <p>🔒 Login to start placing pixels!</p>
            </div>
          )}
        </div>

        {notification && (
          <div className={`notification notification-${notification.type}`}>
            {notification.message}
          </div>
        )}

        <div className="game-content">
          <div className="board-section">
            <PixelBoard
              boardSize={boardSize}
              pixels={pixels}
              onPixelClick={handlePixelClick}
              selectedColor={selectedColor}
              cooldown={cooldown}
            />
          </div>

          <div className="sidebar">
            <ColorPicker
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
            />
            
            <Leaderboard />

            <div className="stats-card card">
              <h3>📊 Game Stats</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{Object.keys(pixels).length}</span>
                  <span className="stat-label">Pixels Placed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{boardSize}x{boardSize}</span>
                  <span className="stat-label">Board Size</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{cooldown}s</span>
                  <span className="stat-label">Cooldown</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
