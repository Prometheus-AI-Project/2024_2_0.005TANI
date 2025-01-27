import React, { useEffect, useState } from 'react';
import './PitchingPage.css';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function PitchingPage() {
  const location = useLocation();
  const { homeTeam, pitcherHeight, pitchForm, awayTeam } = location.state || {};

  // 점수 및 게임 상태 변수 관리
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [inning, setInning] = useState("9회 초");
  const [outs, setOuts] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [balls, setBalls] = useState(0);
  const [runners, setRunners] = useState(0);
  const [hitterOrder, setHitterOrder] = useState(0);
  const [isInningOver, setIsInningOver] = useState(false); 

  const resetCount = () => {
    setStrikes(0);
    setBalls(0);
  };
  
  // 선택된 구종 및 존 정보 관리
  const [selectedPitch, setSelectedPitch] = useState("");
  const [selectedZone, setSelectedZone] = useState(null);


  // 25칸(5x5) 박스를 그리기 위해 Array.from()을 활용
  const zones = Array.from({ length: 25 }, (_, i) => i);
  const battingAverage = [
    0.300, 0.250, 0.275, 0.310, 0.200,
    0.400, 0.300, 0.280, 0.250, 0.320,
    0.220, 0.270, 0.260, 0.290, 0.310,
    0.230, 0.240, 0.210, 0.280, 0.350,
    0.260, 0.270, 0.200, 0.300, 0.250,
  ];

  const [pitchResult, setPitchResult] = useState(null);

  useEffect(() => {
    // FastAPI에서 데이터 가져오기
    const fetchPitchResult = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/pitch/result");
        setPitchResult(response.data); // 데이터 저장



      } catch (error) {
        console.error("Error fetching pitch result:", error);
      }
    };

    fetchPitchResult();
  }, []);

    // pitchResult에 따른 상태 업데이트
    useEffect(() => {
      if (!pitchResult || isInningOver) return;
  
      const handlePitchResult = () => {
        switch (pitchResult) {
          case 'homerun':
            if (runners > 0) {
              setAwayScore(prev => prev + runners + 1); // 주자 수만큼 +1
              setRunners(0); // 주자 초기화
            } else {
              setAwayScore(prev => prev + 1);
            }
            resetCount();
            setHitterOrder(prevOut => prevOut + 1);
            break;
  
          case 'hit':
            setRunners(prev => {
              const newRunner = prev + 1;
              if (newRunner >= 3) {
                setAwayScore(score => score + newRunner);
                return 0;
              }
              return newRunner;
            });
            setHitterOrder(prevOut => prevOut + 1);
            resetCount();
            break;
  
          case 'foul':
            if (strikes < 2) { // 스트라이크는 0,1,2 (3이 되면 아웃)
              setStrikes(prev => prev + 1);
            }
            // Foul 시 스트라이크 2 이상에서는 스트라이크 수 증가하지 않음
            break;
  
          case 'strike':
            setStrikes(prev => {
              const newStrike = prev + 1;
              if (newStrike >= 3) {
                setOuts(prevOut => prevOut + 1);
                setHitterOrder(prevOut => prevOut + 1);
                resetCount();
              }
              return newStrike;
            });
            break;
  
          case 'ball':
            setBalls(prev => {
              const newBall = prev + 1;
              if (newBall >= 4) {
                // 진루 로직 (예: 주자 추가 또는 점수)
                setRunners(prevRunner => Math.min(prevRunner + 1, 3)); // 주자가 3명 이상일 경우 처리
                setHitterOrder(prevOut => prevOut + 1);
                resetCount();
              }
              return newBall;
            });
            break;
  
          default:
            break;
        }
      };
  
      handlePitchResult();
  
      // Check for inning over
      if (outs >= 3) {
        setIsInningOver(true);
        // 추가 로직: 공수 교대 처리
        console.log("Inning over. Switching sides.");
        // 예: 상태 초기화 또는 다른 팀으로 전환
      }
      if (hitterOrder >= 10) {
        setHitterOrder(0);//타순 한 바퀴 다 돌면 1번으로
      }
  
    }, [pitchResult, runners, strikes, balls, outs, isInningOver]);
  

  /*if (!pitchResult) {
    return <div>Loading...</div>;
  }*/

  const getBoxClass = (value) => {
    if (value >= 0.4) return "batting-zone-box red";
    if (value >= 0.3) return "batting-zone-box orange";
    if (value >= 0.2) return "batting-zone-box yellow";
    return "zone-box"; // 기본 클래스
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
    if (!selectedPitch || selectedZone === null) {
      alert("구종과 투구 영역을 선택하세요.");
      return;
    }

    const pitchData = {
      pitchForm: pitchForm || "좌투", // 기본값 설정
      pitchType: selectedPitch || "직구",
      pitcherHeight: pitcherHeight || 185,
      zone: selectedZone !== null ? selectedZone : 0, // 기본값 0
      awayTeam: awayTeam || "NC",
      hitterOrder: hitterOrder || 1,
      outs: outs || 0,
      strikes: strikes || 0,
      balls: balls || 0,
      runners: runners || 1, // 기본값 빈 배열
    };

    try {
      const response = await axios.post('http://localhost:8000/api/pitch', pitchData);
      console.log("Pitch data sent successfully:", response.data);
      alert("투구 정보가 전송되었습니다.");
    } catch (error) {
      console.error("Error sending pitch data:", error);
      alert("투구 정보 전송 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="pitching-page-container">
      {/* 점수판 영역 */}
      <div className="pitching-scoreboard">
        <div className="score-team">{homeTeam} {homeScore}</div>
        <div className="score-inning">
          {inning} {homeScore}-{awayScore} {outs}아웃 {strikes}스트라이크 {balls}볼
        </div>
        <div className="score-team">{awayTeam} {awayScore}</div>
      </div>

      {/* 메인 콘텐트 영역 */}
      <div className="pitching-main">
        <div className="pitcher-info">
          <p>투수 정보 띄우기?</p>
        </div>

        {/* 타율 표시 영역 */}
        <div className="batting-average-container">
          {battingAverage.map((average, index) => (
            <div
              key={index}
              className={getBoxClass(average)}
            >
              {average.toFixed(3)} {/* 소수점 3자리로 표시 */}
            </div>
          ))}
        </div>

        {/* 투수가 던질 영역 선택 */}
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

        {/* 구종 선택 컴포넌트 */}
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
      </div>

      {/* 던지기 버튼 */}
      <div className="throw-pitch-container">
        <button
          className="throw-pitch-button"
          onClick={handleThrowPitch}
          disabled={!selectedPitch || selectedZone === null} // 조건 추가
        >
          던지기
        </button>
      </div>

      
    </div>
  );
}

export default PitchingPage;
