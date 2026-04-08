import { useState } from 'react';
import '../styles/PixelBoard.css';

const PixelBoard = ({ boardSize, pixels, onPixelClick, selectedColor, cooldown }) => {
  const [hoveredPixel, setHoveredPixel] = useState(null);
  
  const pixelSize = Math.max(4, Math.min(10, Math.floor(600 / boardSize)));

  const getPixelColor = (x, y) => {
    return pixels[`${x},${y}`]?.color || '#1e293b';
  };

  const handlePixelClick = (x, y) => {
    if (cooldown > 0) return;
    onPixelClick(x, y, selectedColor);
  };

  const renderBoard = () => {
    const grid = [];
    
    for (let y = 0; y < boardSize; y++) {
      const row = [];
      for (let x = 0; x < boardSize; x++) {
        const color = getPixelColor(x, y);
        const isHovered = hoveredPixel?.x === x && hoveredPixel?.y === y;
        
        row.push(
          <div
            key={`${x}-${y}`}
            className="pixel"
            style={{
              backgroundColor: color,
              width: `${pixelSize}px`,
              height: `${pixelSize}px`,
              boxShadow: isHovered && cooldown === 0 ? '0 0 8px rgba(99, 102, 241, 0.8)' : 'none',
              transform: isHovered ? 'scale(1.2)' : 'scale(1)',
              zIndex: isHovered ? 10 : 1
            }}
            onClick={() => handlePixelClick(x, y)}
            onMouseEnter={() => setHoveredPixel({ x, y })}
            onMouseLeave={() => setHoveredPixel(null)}
            title={`(${x}, ${y})`}
          />
        );
      }
      grid.push(
        <div key={y} className="pixel-row">
          {row}
        </div>
      );
    }
    
    return grid;
  };

  return (
    <div className="pixel-board-container">
      <div 
        className="pixel-board"
        style={{
          gridTemplateColumns: `repeat(${boardSize}, ${pixelSize}px)`
        }}
      >
        {renderBoard()}
      </div>
      
      {cooldown > 0 && (
        <div className="cooldown-overlay">
          <div className="cooldown-timer">
            <span className="timer-icon">⏳</span>
            <span>{cooldown}s</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PixelBoard;
