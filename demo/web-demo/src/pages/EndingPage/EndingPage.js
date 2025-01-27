import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './EndingPage.css';

function Ending() {
  const location = useLocation();
  const navigate = useNavigate();
  const { homeTeam, awayTeam, homeScore, awayScore } = location.state || {};

  // homeTeam 기준으로 이겼는지 졌는지를 판별
  const isHomeTeamWinner = homeScore > awayScore;
  const isDraw = homeScore === awayScore; // 무승부 상황 대비

  // 승패 메시지 설정
  let resultMessage;
  if (isDraw) {
    resultMessage = `무승부입니다! ${homeTeam} vs ${awayTeam} 점수: ${homeScore} : ${awayScore}`;
  } else if (isHomeTeamWinner) {
    resultMessage = `축하합니다! ${homeTeam}이(가) 승리하였습니다!`;
  } else {
    resultMessage = `아쉽게도 ${homeTeam}이(가) 패배하였습니다...`;
  }

  // 다시 플레이(혹은 다른 페이지로 이동)를 위한 예시 함수
  const handlePlayAgain = () => {
    // 예: 홈 화면 혹은 다른 페이지로 이동
    navigate('/');
  };

  return (
    <div className="ending-container">
      <div className="ending-content">
        <h1 className="ending-title">Game Over</h1>
        <p className="ending-result">{resultMessage}</p>

        <div className="ending-scoreboard">
          <div className="ending-score-team">
            <span className="team-name">{homeTeam}</span>
            <span className="team-score">{homeScore}</span>
          </div>
          <div className="ending-score-team">
            <span className="team-name">{awayTeam}</span>
            <span className="team-score">{awayScore}</span>
          </div>
        </div>

        <div className="ending-actions">
          <button onClick={handlePlayAgain} className="ending-button">
            다시 플레이하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default Ending;
