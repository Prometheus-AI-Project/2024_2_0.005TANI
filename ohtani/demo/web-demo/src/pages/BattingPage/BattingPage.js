import React, { useState } from 'react';
import './BattingPage.css';
//import ResultPage from './ResultPage';

import batter from '../../assets/img/background/batter.png';
// import player1 from '../../assets/img/player1.png';
// import player2 from '../../assets/img/player2.png';

function BattingPage() {

  const zones = Array.from({ length: 25 }, (_, i) => i);

  const battingAverage = [
    0.300, 0.250, 0.275, 0.310, 0.200,
    0.400, 0.300, 0.280, 0.250, 0.320,
    0.220, 0.270, 0.260, 0.290, 0.310,
    0.230, 0.240, 0.210, 0.280, 0.350,
    0.260, 0.270, 0.200, 0.300, 0.250,
  ];

  const [clickedZone, setClickedZone] = useState(null); // 클릭된 버튼 상태 저장
  const [showPopup, setShowPopup] = useState(false); // 팝업 상태
  const [decision, setDecision] = useState(null); // "칠래" 또는 "안 칠래" 상태
  const [popupMessage, setPopupMessage] = useState(null); // 팝업 메시지 상태
  const [showGif, setShowGif] = useState(false); // .gif 파일 표시 상태


  const getBoxClass = (value, index) => {
    let baseClass = "batting-zone-box";
    if (value >= 0.4) baseClass += " red";
    else if (value >= 0.3) baseClass += " orange";
    else if (value >= 0.2) baseClass += " yellow";

    // 클릭된 버튼에 추가 클래스 적용
    if (index === clickedZone) baseClass += " clicked";
    return baseClass;
  };


  const handleZoneClick = (index) => {
    setClickedZone(index); // 클릭된 존 업데이트
    setShowPopup(true); // 팝업 표시
    setTimeout(() => {
      setShowPopup(false); // 팝업 자동 숨김
    }, 2000); // 2초 후 팝업 숨김
    //setShowResult(true);
  };

  const handleDecision = (choice) => {
    setDecision(choice); // 선택한 "칠래" 또는 "안 칠래" 상태 저장
    console.log(`User decision: ${choice}`);
  };

  // `타율이 ${battingAverage[index]}인 zone ${index + 1}이 선택되었습니다.`
  
  return (
    <div className="batting-page-container">
      {/* 상단 스코어보드 */}
      <div className="batting-scoreboard">
        <div className="team-info">
          <span>삼성</span>
          <span>0</span>
        </div>
        <div className="inning-info">
          <span>1회</span>
          <span>0 - 0</span>
        </div>
        <div className="team-info">
          <span>한화</span>
          <span>0</span>
        </div>
      </div>

        {/* 통합된 5x5 그리드 */}
      <div className="zone-container integrated-grid">
        {battingAverage.map((average, index) => (
          <button
            key={index}
            className={getBoxClass(average)}
            onClick={() => handleZoneClick(index)}
          >
            {average.toFixed(3)}
          </button>
        ))}
      </div>
      {/* 팝업 메시지 */}
      {showPopup && clickedZone !== null && (
       <div className="popup">
          <p>
            {clickedZone + 1}번 존이 선택되었습니다. 타율: {battingAverage[clickedZone].toFixed(3)}
          </p>
        </div>
      )}
      {/* 좌측 하단 선택 버튼 */}
      <div className="decision-buttons">
        <button onClick={() => handleDecision("I'll hit the ball")} className="decision-button">
          I'll hit the ball
        </button>
        <button onClick={() => handleDecision("I won't hit the ball")} className="decision-button">
         I won't hit the ball
        </button>
      </div>


        {/* 중앙(투수/배터 박스 등) */}
        {/* <div className="pitcher-center">
          <span>투수: 김택연 '24</span>
        </div>

        {/* 오른쪽 선수 카드 */}
        {/* <div className="player-card player-card-right">
          <div className="player-card-header">김택연'24</div>
          <div className="player-stats">
            <ul>
              <li>제구 80</li>
              <li>구위 77</li>
              <li>체력 82</li>
              <li>직구 66</li>
              <li>변화 69</li>
            </ul>
          </div>
        </div>  */}

        {/* <div className="zone-container">
          {zones.map((zoneIndex) => (
            <div key={zoneIndex} className="zone-box"></div>
          ))}
        </div>
      </div> */}

      {/* 하단 타격 정보 예시 */}
      <div className="batting-info-bottom">
        <div className="info-item">
          <strong>타율</strong> 0.000
        </div>
        <div className="info-item">
          <strong>홈런</strong> 0
        </div>
        <div className="info-item">
          <strong>타점</strong> 0
        </div>
        <div className="info-item">
          <strong>출루율</strong> 0.000
        </div>
      </div>
    </div>
  );
}

export default BattingPage;
