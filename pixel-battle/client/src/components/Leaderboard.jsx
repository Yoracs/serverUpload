import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import '../styles/Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useState(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pixels/leaderboard');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  if (loading) {
    return (
      <div className="leaderboard card">
        <h2 className="leaderboard-title">Loading...</h2>
      </div>
    );
  }

  return (
    <div className="leaderboard card">
      <h2 className="leaderboard-title">🏆 Top Players</h2>
      
      <div className="leaderboard-list">
        {leaderboard.map((player, index) => (
          <div 
            key={player._id} 
            className={`leaderboard-item ${user?._id === player._id ? 'current-user' : ''}`}
          >
            <div className="rank">{getRankIcon(index)}</div>
            <div className="player-info">
              <span className="player-name">
                {player.username}
                {player.role === 'admin' && ' 👑'}
              </span>
              {user?._id === player._id && (
                <span className="you-badge">You</span>
              )}
            </div>
            <div className="pixels-count">
              <span className="pixels-number">{player.pixelsPlaced}</span>
              <span className="pixels-label">pixels</span>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <p className="no-data">No players yet. Be the first!</p>
      )}

      <button className="refresh-btn" onClick={loadLeaderboard}>
        🔄 Refresh
      </button>
    </div>
  );
};

export default Leaderboard;
