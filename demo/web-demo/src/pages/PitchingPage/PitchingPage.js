import React, { useEffect, useState } from 'react';
import './PitchingPage.css';
import { useLocation, useNavigate  } from 'react-router-dom';

import axios from 'axios';

function PitchingPage() {
  const location = useLocation();

  //'/setting'에서 입력한 정보 받아오기
  const { homeTeam, pitcherHeight, pitchHand, pitchForm, awayTeam } = location.state || {};
  
  const [showIntroPopup, setShowIntroPopup] = useState(true);

  const [eventPopupVisible, setEventPopupVisible] = useState(false);
  const [eventPopupMessage, setEventPopupMessage] = useState('');
  const [eventPopupImage, setEventPopupImage] = useState(null);

  const handleIntroConfirm = () => {
    setShowIntroPopup(false);
  };

  // 점수 및 게임 상태 변수 관리
  const [homeScore, setHomeScore] = useState(7);
  const [awayScore, setAwayScore] = useState(7);
  const [inning, setInning] = useState("9회 초");
  const [outs, setOuts] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [balls, setBalls] = useState(0);
  const [runners, setRunners] = useState(0);
  const [hitterOrder, setHitterOrder] = useState(0);

  const [AIassistant, setAIassistant] = useState(false);
  const [pitchAssistValue, setPitchAssistValue] = useState([
    0.300, 0.250, 0.275, 0.310, 0.200,
    0.400, 0.300, 0.280, 0.250, 0.320,
    0.220, 0.270, 0.260, 0.290, 0.310,
    0.230, 0.240, 0.210, 0.280, 0.350,
    0.260, 0.270, 0.200, 0.300, 0.250,
  ]);
  const navigate = useNavigate(); // React Router의 navigate 함수 사용

  const resetCount = () => {
    setStrikes(0);
    setBalls(0);
  };
  
  // 선택된 구종 및 존 정보 관리
  const [selectedPitch, setSelectedPitch] = useState("");
  const [selectedZone, setSelectedZone] = useState(null);


  // 25칸(5x5) 박스를 그리기 위해 Array.from()을 활용
  const zones = Array.from({ length: 25 }, (_, i) => i);
  

  const [pitchResult, setPitchResult] = useState(null);


useEffect(() => {
    if (eventPopupVisible) {
      const timer = setTimeout(() => {
        setEventPopupVisible(false);
      }, 4000);

      // cleanup: 해당 effect 재실행 시 이전 타이머를 정리
      return () => clearTimeout(timer);
    }
  }, [eventPopupVisible]);

useEffect(() => {

  // pitchResult가 null이면 로직 실행 안 함
  if (pitchResult === null) return;
  //alert(pitchResult)
  const handlePitchResult = () => {

    let message = '';

    switch (pitchResult) {
      case 'homerun':


        if (runners > 0) {
          setAwayScore((prev) => prev + runners + 1);
          setRunners(0);
        } else {
          setAwayScore((prev) => prev + 1);
        }
        resetCount();
        setHitterOrder((prev) => prev + 1);

        message="홈런!";

        break;

      case 'hit':
        setRunners((prev) => {
          const newRunner = prev + 1;
          if (newRunner > 3) {
            setAwayScore((score) => score + newRunner);
            return 0;
          }
          return newRunner;
        });
        setHitterOrder((prev) => prev + 1);
        resetCount();

        message = "안타!";

        break;

      case 'foul':
        if (strikes < 2) {
          setStrikes((prev) => prev + 1);
        }

        message = "파울!";

        break;

      case 'strike':
        let tempMsg="스트라이크!";

        setStrikes((prev) => {
          const newStrike = prev + 1;

          if (newStrike >= 3) {

            tempMsg = "3스트라이크로 인해 아웃됩니다!";

            setOuts((prevOut) => prevOut + 1);
            setHitterOrder((prev) => prev + 1);
            resetCount();

          } 
          return newStrike;
        });

        message = tempMsg;

        break;

      case 'ball':

        let temMsg = "볼!";
        setBalls((prev) => {
          const newBall = prev + 1;

          if (newBall >= 4) {

            if (runners === 3){
              setAwayScore((prev) => prev + 1);
              setRunners(0);
            }
            else{
              setRunners((prevRunner) => Math.min(prevRunner + 1, 3));
            }
            setHitterOrder((prev) => prev + 1);
            resetCount();
            temMsg = "볼넷!";
          } 
          return newBall;
        });

        message = temMsg;
        break;

      case 'out':
        message = "아웃!";
        setOuts((prev) => prev + 1);
        setHitterOrder((prev) => prev + 1);
        resetCount();
        break;

      default:
        break;
    }
    if (message) {
      setEventPopupMessage(message);
      setEventPopupVisible(true); // 여기서 팝업을 띄운다!
    }

    
  };

  // 실제 로직 실행
  handlePitchResult();

  // 처리 완료 후 pitchResult를 다시 null로 만들어 재실행 방지
  setPitchResult(null);

// 의존성 배열에서 pitchResult만 포함
}, [pitchResult]);

  useEffect(() => {
  if (outs >= 3) {
    console.log("Inning over. Switching sides.");
    alert("3아웃!! 수비가 끝났습니다. 9회말로 이동합니다");
    navigate('/bat', {
      state: {
        homeTeam,
        awayTeam,
        homeScore,
        awayScore
      }
    });
    // 추가 로직: 상태 초기화 또는 상대팀으로 전환 등
  }
}, [outs]);

  useEffect(() => {
    if (hitterOrder >= 10) {
      setHitterOrder(0);
    }
  }, [hitterOrder]);
  /*if (!pitchResult) {
    return <div>Loading...</div>;
  }*/

  const getBoxClass = (value) => {
    if (value >= 0.4) return "batting-assist-box red";
    if (value >= 0.3) return "batting-assist-box orange";
    if (value >= 0.2) return "batting-assist-box yellow";
    if (value >= 0.1) return "batting-assist-box white";
    if (value >= 0.0) return "batting-assist-box gray";
    return "assist-box"; // 기본 클래스
  };

  const pitchTypes = ["투심", "포심", "커터", "커브","슬라이더","체인지업", "포크볼"];

  const handlePitchSelect = (pitch) => {
    setSelectedPitch(pitch);
    console.log(`Selected Pitch: ${pitch}`);
  };

  const handleZoneSelect = (zoneIndex) => {
    setSelectedZone(zoneIndex);
    console.log(`Selected Zone: ${zoneIndex}`);
  };

  const handleThrowPitch = async () => {
    setPitchResult(null);
    if (!selectedPitch || selectedZone === null) {
      alert("구종과 투구 영역을 선택하세요.");
      return;
    }

    const pitchData = {
      pitchHand : pitchHand || '좌투',
      pitchForm: pitchForm || "오버핸드", // 기본값 설정
      pitchType: selectedPitch || "직구",
      pitcherHeight: pitcherHeight || 185,
      zone: selectedZone !== null ? selectedZone+1 : 1, 
      awayTeam: awayTeam || "NC",
      hitterOrder: hitterOrder || 1,
      outs: outs || 0,
      strikes: strikes || 0,
      balls: balls || 0,
      runners: runners || 0,
    };

    try {
      const getResult  = await axios.post('http://localhost:8000/api/pitch', pitchData);
      console.log('[DEBUG] pitchResult from server:', getResult.data);
      setPitchResult(getResult.data);


      await getAIAssistant();
      // 필요하다면 AIassistant 상태 업데이트 (예: true로 전환)
      setAIassistant(true);
    } catch (error) {
      console.error("Error sending pitch data:", error);
      alert("투구 정보 전송 중 오류가 발생했습니다.");
    }

   
  };

  const getAIAssistant = async () => {

    const pitchAssistData = {
      pitchHand : pitchHand || '좌투',
      awayTeam: awayTeam || "NC",
      hitterOrder: hitterOrder || 1,
      strikes: strikes || 0,
      balls: balls || 0,
      runners: runners || 1, // 기본값 빈 배열
    };


    try {
      const getResult  = await axios.post('http://localhost:8000/api/pitchAI', pitchAssistData);
      setPitchAssistValue(getResult.data);
      
      
    } catch (error) {
      console.error("Error sending pitch data:", error);
      alert("투구 정보 전송 중 오류가 발생했습니다.");
    }
    // 여기서 원하는 동작(함수 실행, 상태 업데이트 등)을 처리
  };

  useEffect(() => {
    // aiAssistant가 false라면 handleAiAssistantFalse 함수 실행
    if (AIassistant === false) {
      getAIAssistant();
    }
  }, [AIassistant]); // aiAssistant 값이 변경될 때마다 이 훅이 재실행


  

  //지금 생기는 이슈: 
  return (
    <div className="pitching-page">
      {/* Intro */}
    {showIntroPopup && (
            <div className="intro-popup-overlay">
              <div className="intro-popup">
                <p>먼저 플레이어가 투수가 되어 AI 타자를 상대로 수비를 시작합니다.</p>
                  

                <p>*좌측의 AI 보조 장치가 예측한 타자의 출루율 참고해 투구를 진행하세요.</p>
                
                <button onClick={handleIntroConfirm}
                style={{ fontSize: '20px', padding: '7px 14px' }}>
                  확인</button>
              </div>
            </div>
          )}

      <div className="pitching-scoreboard">
        {/* 왼쪽: 점수와 이닝 정보를 담은 컨테이너 (흰색 배경) */}
        <div className="left-side">
          <div className="score-container">
            <div className="team-wrapper">
              <span className="team home">{homeTeam}</span>
              <span className="teamInfo">(플레이어 팀)</span>
            </div>
            <span className="score home">{homeScore}</span>
            <span className="score away">{awayScore}</span>
            <div className="team-wrapper">
              <span className="team away">{awayTeam}</span>
              <span className="teamInfo">(AI 팀)</span>
            </div>
          </div>
          <div className="inning-info">
            {inning}
          </div>
        </div>
        
        {/* 오른쪽: 세로로 쌓인 볼/스트라이크/아웃 카운트 */}
        <div className="count-container">
          {/* Ball 카운트 */}
          <div className="count-group">
            <div className="count-label">Ball</div>
            <div className="circle-container">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`circle ${i < balls ? "ballfilled" : ""}`}></div>
              ))}
            </div>
          </div>
          {/* Strike 카운트 */}
          <div className="count-group">
            <div className="count-label">Strike</div>
            <div className="circle-container">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`circle ${i < strikes ? "strikefilled" : ""}`}></div>
              ))}
            </div>
          </div>
          {/* Out 카운트 */}
          <div className="count-group">
            <div className="count-label">Out</div>
            <div className="circle-container">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`circle ${i < outs ? "outfilled" : ""}`}></div>
              ))}
            </div>
          </div>
          
        </div>
        {/* 다이아몬드 (가운데) */}
        <div className="baseball-diamond-container">
              <div className="baseball-diamond">
                <div className={`base base-1 ${runners >= 1 ? "occupied" : ""}`} />
                <div className={`base base-2 ${runners >= 2 ? "occupied" : ""}`} />
                <div className={`base base-3 ${runners >= 3 ? "occupied" : ""}`} />
                            
              </div>
          </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="pitching-main">
 
        {/* 타율 표시 */}
        <div className="ai-assistant-wrapper">
          <h2>AI Predict </h2>
          <h4>(타자 구역별 타율) </h4>
          <div className="batting-average-container">
            {pitchAssistValue.map((average, index) => (
              <div key={index} className={getBoxClass(average)}>
                {average.toFixed(3)}
              </div>
            ))}
          </div>
        </div>
        
        {/* 코맨트 */}
        <div className="game-comment-wrapper">
          <h4 > *투수는 사람이므로 투구는 선택 위치에서 상하좌우 한 칸씩 벗어날 수 있습니다.</h4>
          <h4 > *좌측의 정보를 통해 AI 타자의 타율을 참고해서 투구해보세요.</h4>
        </div>

        {/* 투수가 던질 존(Zone) 선택 */}
        <div className="pitcher-zone-container">
          {zones.map((zoneIndex) => (
            <div
              key={zoneIndex}
              className={`zone-box ${selectedZone === zoneIndex ? "selected" : ""}`}
              onClick={() => handleZoneSelect(zoneIndex)}
            >
              {zoneIndex + 1}
            </div>
          ))}
        </div>

        {/* 구종 선택 버튼 */}
        <div className="pitch-type-selector">
          <h3>구종 선택</h3>
          {pitchTypes.map((pitch, index) => (
            <button
              key={index}
              className={`pitch-type-button ${selectedPitch === pitch ? "selected" : ""}`}
              onClick={() => handlePitchSelect(pitch)}
            >
              {pitch}
            </button>
          ))}
        </div>
  
        {/* 던지기 버튼 */}
        <div className="throw-pitch-container">
          <button
            className="throw-pitch-button"
            onClick={handleThrowPitch}
            disabled={!selectedPitch || selectedZone === null}
          >
            던지기
          </button>
        </div>
      </div>
           {/* 이벤트 팝업 (4초 뒤에 자동으로 사라짐) */}
      {eventPopupVisible && (
        <div className="event-popup-overlay">
          <div className="event-popup">
            {/* 이미지가 있으면 표시 */}
            {eventPopupImage && (
              <img
                src={eventPopupImage}
                alt="이벤트 이미지"
                className="event-popup-image"
              />
            )}
            {/* 메시지 표시 */}
            <p className="event-popup-message">{eventPopupMessage}</p>
            {/* 닫기 버튼(원한다면 수동으로도 닫을 수 있도록) */}
            <button
              className="event-popup-close-button"
              onClick={() => setEventPopupVisible(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
}

export default PitchingPage;
