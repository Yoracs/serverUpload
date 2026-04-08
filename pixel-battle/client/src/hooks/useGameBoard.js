import { useState, useEffect } from 'react';
import api from '../utils/api';

export const useGameBoard = () => {
  const [boardSize, setBoardSize] = useState(100);
  const [pixels, setPixels] = useState({});
  const [loading, setLoading] = useState(true);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    loadBoard();
    
    const cooldownInterval = setInterval(() => {
      setCooldown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(cooldownInterval);
  }, []);

  const loadBoard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pixels/board');
      setBoardSize(response.data.boardSize);
      setPixels(response.data.pixels);
    } catch (error) {
      console.error('Error loading board:', error);
    } finally {
      setLoading(false);
    }
  };

  const placePixel = async (x, y, color) => {
    try {
      const response = await api.put('/pixels/place', { x, y, color });
      
      // Update local state
      setPixels(prev => ({
        ...prev,
        [`${x},${y}`]: {
          color,
          placedBy: response.data.pixel.placedBy,
          placedAt: new Date()
        }
      }));

      if (response.data.cooldown) {
        setCooldown(response.data.cooldown);
      }

      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        setCooldown(error.response.data.cooldown);
      }
      throw error;
    }
  };

  const updatePixel = (x, y, color, placedBy) => {
    setPixels(prev => ({
      ...prev,
      [`${x},${y}`]: {
        color,
        placedBy,
        placedAt: new Date()
      }
    }));
  };

  const clearBoard = () => {
    setPixels({});
  };

  const getPixelColor = (x, y) => {
    return pixels[`${x},${y}`]?.color || null;
  };

  return {
    boardSize,
    pixels,
    loading,
    cooldown,
    loadBoard,
    placePixel,
    updatePixel,
    clearBoard,
    getPixelColor
  };
};
