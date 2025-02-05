import React, { useEffect, useState } from 'react';
import './PitchingPage.css';
import { useLocation, useNavigate  } from 'react-router-dom';

import axios from 'axios';

function PitchingPage() {
  const location = useLocation();
  const { homeTeam, pitcherHeight, pitchHand, pitchForm, awayTeam } = location.state || {};
  
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
  // pitchResult가 null이면 로직 실행 안 함
  if (pitchResult === null) return;
  alert(pitchResult)
  const handlePitchResult = () => {
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
        break;

      case 'foul':
        if (strikes < 2) {
          setStrikes((prev) => prev + 1);
        }
        break;

      case 'strike':
        setStrikes((prev) => {
          const newStrike = prev + 1;
          if (newStrike >= 3) {
            setOuts((prevOut) => prevOut + 1);
            setHitterOrder((prev) => prev + 1);
            resetCount();
          }
          return newStrike;
        });
        break;

      case 'ball':
        setBalls((prev) => {
          const newBall = prev + 1;
          if (newBall >= 4) {
            setRunners((prevRunner) => Math.min(prevRunner + 1, 3));
            setHitterOrder((prev) => prev + 1);
            resetCount();
          }
          return newBall;
        });
        break;

      case 'out':
        setOuts((prev) => {
          const newOut = prev + 1;
          setHitterOrder((prev) => prev + 1);
          resetCount();
          return newOut;
        });
        break;

      default:
        break;
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
    alert("수비가 끝났습니다. 9회말로 이동합니다");
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

  const pitchTypes = ["직구", "슬라이더", "커브", "체인지업", "스플리터", "포크볼"];

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
      zone: selectedZone !== null ? selectedZone : 1, // 기본값 0
      awayTeam: awayTeam || "NC",
      hitterOrder: hitterOrder || 1,
      outs: outs || 0,
      strikes: strikes || 0,
      balls: balls || 0,
      runners: runners || 1, // 기본값 빈 배열
    };

    try {
      const getResult  = await axios.post('http://localhost:8000/api/pitch', pitchData);
      
      setPitchResult(getResult.data);
      setAIassistant(false);//경기 상황 변동 반영하여 새로운 AI 보조값 생성
      
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


  
  return (
    <div className="pitching-page">
      {/* 스코어보드 */}
      <div className="pitching-scoreboard">
        {/* 왼쪽 팀 점수 */}
        <div className="score-team left">
          {homeTeam}   {homeScore}
        </div>

        {/* 이닝, 볼카운트, 아웃 정보 */}
        <div className="score-inning">
          {inning}  {outs} 아웃 {strikes} 스트라이크 {balls} 볼
        </div>

        {/* 다이아몬드 (가운데) */}
        <div className="baseball-diamond-container">
          <div className="baseball-diamond">
            <div className={`base base-1 ${runners >= 1 ? "occupied" : ""}`} />
            <div className={`base base-2 ${runners >= 2 ? "occupied" : ""}`} />
            <div className={`base base-3 ${runners >= 3 ? "occupied" : ""}`} />
                        
          </div>
        </div>
  
        {/* 오른쪽 팀 점수 */}
        <div className="score-team right">
          {awayScore}   {awayTeam} 
        </div>
      </div>
  
      
  
      {/* 메인 콘텐츠 */}
      <div className="pitching-main">
        <div className="pitcher-info">
          <p>투수 정보 띄우기?</p>
        </div>
  
        {/* 타율 표시 */}
        <div className="ai-assistant-wrapper">
          <h2>AI Predict Result</h2>
          <div className="batting-average-container">
            {pitchAssistValue.map((average, index) => (
              <div key={index} className={getBoxClass(average)}>
                {average.toFixed(3)}
              </div>
            ))}
          </div>
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
  
        <div className="batter-info">
          <p>타자 정보 띄우기</p>
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
    </div>
  );
  
}

export default PitchingPage;
