import React, { useEffect, useState } from 'react';
import './BattingPage.css';
import '../PitchingPage/PitchingPage.css';
//import ResultPage from './ResultPage';

import { useLocation, useNavigate  } from 'react-router-dom';
import axios from 'axios';


import batter from '../../assets/img/background/batter.png';
// import player1 from '../../assets/img/player1.png';
// import player2 from '../../assets/img/player2.png';

function BattingPage() {

  const zones = Array.from({ length: 25 }, (_, i) => i);

  const [pitchingProbability, setPitchingProbability] = useState([
    0.300, 0.250, 0.275, 0.310, 0.200,
    0.400, 0.300, 0.280, 0.250, 0.320,
    0.220, 0.270, 0.260, 0.290, 0.310,
    0.230, 0.240, 0.210, 0.280, 0.350,
    0.260, 0.270, 0.200, 0.300, 0.250,
  ]);

  const [clickedZone, setClickedZone] = useState(null); // 클릭된 버튼 상태 저장
  const [showPopup, setShowPopup] = useState(false); // 팝업 상태
  const [decision, setDecision] = useState(null); // "칠래" 또는 "안 칠래" 상태
  const [popupMessage, setPopupMessage] = useState(null); // 팝업 메시지 상태
  const [showGif, setShowGif] = useState(false); // .gif 파일 표시 상태
  const location = useLocation();
   const [batResult, setBatResult] = useState(null);
  
  const { homeTeam, awayTeam, homeScore: initialHomeScore, awayScore: initialAwayScore } = location.state || {};
  const [homeScore, setHomeScore] = useState(initialHomeScore || 0);
  const [awayScore, setAwayScore] = useState(initialAwayScore || 0);
  // 점수 및 게임 상태 변수 관리
  const [inning, setInning] = useState("9회 말");
  const [outs, setOuts] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [balls, setBalls] = useState(0);
  const [runners, setRunners] = useState(0);
  const [hitterOrder, setHitterOrder] = useState(0);
  const navigate = useNavigate();

  const resetCount = () => {
    setStrikes(0);
    setBalls(0);
  };

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
  
  const handleBat = async (mode) => {
  
    
  
    // 공통으로 사용할 데이터 객체 생성
    const batData = {
      zone: clickedZone !== null ? clickedZone : 0, // 기본값 0
      awayTeam: awayTeam || "NC",
      homeTeam: homeTeam || "SSG",
      hitterOrder: hitterOrder || 1,
      outs: outs || 0,
      strikes: strikes || 0,
      balls: balls || 0,
      runners: runners || 1,
    };

    const batAssistData = {
      awayTeam: awayTeam || "NC",
      homeTeam: homeTeam || "SSG",
      hitterOrder: hitterOrder || 1,
      outs: outs || 0,
      strikes: strikes || 0,
      balls: balls || 0,
      runners: runners || 1,
    };
  
    // 모드에 따른 분기 처리
    if (mode === "bat") {
      // 공통으로 배팅 영역 선택 확인
      if (clickedZone === null) {
        alert("배팅 영역을 선택하세요.");
        return;
      }
      setBatResult(null);
      try {
        const getResult = await axios.post('http://localhost:8000/api/bat', batData);
        setBatResult(getResult.data);
      } catch (error) {
        console.error("Error sending pitch data:", error);
        alert("배팅 정보 전송 중 오류가 발생했습니다.");
      }
    } else if (mode === "batai") {
      try {
        // 예시: batai 모드에서는 다른 API 엔드포인트를 호출
        const getpitchingProbability = await axios.post('http://localhost:8000/api/batAI', batAssistData);
        setPitchingProbability(getpitchingProbability.data);

      } catch (error) {
        console.error("Error sending bat AI data:", error);
        alert("배팅 AI 정보 전송 중 오류가 발생했습니다.");
      }
    } else {
      alert("알 수 없는 모드입니다.");
    }

  };
  
  // 페이지가 처음 로드될 때 handleBat('batai')를 호출하여 pitchingProbability를 업데이트
  useEffect(() => {
    handleBat("batai");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // batResult가 null이면 로직 실행 안 함
    if (batResult === null) return;
    alert(batResult)

    const handleBatResult = () => {
      switch (batResult) {
        case 'homerun':
          if (runners > 0) {
            setHomeScore((prev) => prev + runners + 1);
            setRunners(0);
          } else {
            setHomeScore((prev) => prev + 1);
          }
          resetCount();
          setHitterOrder((prev) => prev + 1);

          navigate('/homerun')
          break;
  
        case 'hit':
          setRunners((prev) => {
            const newRunner = prev + 1;
            if (newRunner > 3) {
              setHomeScore((score) => score + newRunner);
              return 0;
            }
            return newRunner;
          });
          setHitterOrder((prev) => prev + 1);
          resetCount();

          navigate('/hit')
          break;
  
        case 'foul':
          if (strikes < 2) {
            setStrikes((prev) => prev + 1);
          }
          navigate('/foul')
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
          navigate('/homerun')
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
          
          navigate('/ball')
          break;
  
        case 'out':
          setOuts((prev) => {
            const newOut = prev + 1;
            setHitterOrder((prev) => prev + 1);
            resetCount();
            return newOut;
          });
          navigate('/out')
          break;
  
        default:
          break;
      }
  
      
    };
  
    // 실제 로직 실행
    handleBatResult();

    //bat 결과 반영 후 batai 최신화
    handleBat('batai');
    // 처리 완료 후 batResult를 다시 null로 만들어 재실행 방지
    setBatResult(null);
  
  // 의존성 배열에서 batResult만 포함
  }, [batResult]);

  useEffect(() => {
    if (outs >= 3) {
      console.log("Inning over. Game Finished");
      alert("게임이 종료되었습니다.");
      navigate('/end', {
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
  // `타율이 ${pitchingProbability[index]}인 zone ${index + 1}이 선택되었습니다.`
  
  return (
    <div className="batting-page-container">
      {/* 상단 스코어보드 */}
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

        {/* 통합된 5x5 그리드 */}
      <div className="zone-container integrated-grid">
        {pitchingProbability.map((average, index) => (
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
            {clickedZone + 1}번 존이 선택되었습니다. AI 예측 구사율: {pitchingProbability[clickedZone].toFixed(3)}
          </p>
        </div>
      )}
  


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
      {/* 치기 버튼 */}
      
      <div className="bat-container">
        <button
          className="bat-button"
          onClick={() => handleBat("bat")}  // 콜백 함수를 전달
          disabled={clickedZone === null}
        >
          치기
        </button>
      </div>

    </div>
  );
}



export default BattingPage;
