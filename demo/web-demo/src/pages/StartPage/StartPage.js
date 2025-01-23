import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StartPage.css';

function StartPage() {
  const navigate = useNavigate(); // useNavigate hook을 사용해 페이지 이동 처리

  const handleSettingGame = () => {
    navigate('/setting'); // /settings 경로로 이동
  };

  return (
    <div className="start-page-container">
      <h1 style={{ color: '#fff' }}>Welcome to 0.005TANI Game</h1>
      <button onClick={handleSettingGame} className="setting-game-button">
        Go Game Setting
      </button>
    </div>
  );
}

export default StartPage;
