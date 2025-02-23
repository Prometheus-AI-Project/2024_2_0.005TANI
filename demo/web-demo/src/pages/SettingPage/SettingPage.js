import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SettingPage.css';
import field from '../../assets/img/background/field.jpg';

function SettingPage() {
  const [homeTeam, setHomeTeam] = useState('');
  const [pitcher, setPitcher] = useState('');
  const [pitcherHeight, setPitcherHeight] = useState('');
  const [pitchHand, setpitchHand] = useState('');
  const [pitchForm, setpitchForm] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const teamList = ['기아 타이거즈','삼성 라이온즈', 'LG 트윈스', '두산 베어스','KT 위즈','SSG 랜더스','롯데 자이언츠','한화 이글스','NC 다이노스', '키움 히어로즈'];
  const pitchHandList = ['좌투','우투'];
  const pitchFormList = ['오버핸드','쓰리쿼터', '사이드암'];

  const handleStartGame = () => {
    // 필수 필드 입력 여부 확인
    if (!homeTeam || !pitcherHeight || !pitchForm || !awayTeam) {
      setErrorMessage('모든 필드를 입력해주세요.');
      return;
    }
    
    // 투수의 키가 숫자인지 및 160 ~ 200 사이인지 확인
    const height = parseInt(pitcherHeight, 10);
    if (isNaN(height) || height < 160 || height > 200) {
      setErrorMessage('투수의 키는 160cm와 200cm 사이여야 합니다.');
      return;
    }
    
    // 플레이어 팀과 상대 팀이 동일한지 확인
    if (homeTeam === awayTeam) {
      setErrorMessage('플레이어 팀과 상대 팀이 동일합니다! 서로 다른 팀을 선택해주세요.');
      return;
    }
    
    setErrorMessage(''); // 오류 메시지 초기화
    
    navigate('/pitch', {
      state: {
        homeTeam,
        pitcherHeight: height, // 숫자로 전달
        pitchHand,
        pitchForm,
        awayTeam
      }
    });
  };

  return (
    <div className="setting-page-container">
      <div className="setting-select-area">
        <div className="setting-select-row">
          <label className="setting-select-label">플레이어가 경기할 팀을 선택하세요.</label>
          <select 
            className="setting-select-box" 
            value={homeTeam} 
            onChange={(e) => setHomeTeam(e.target.value)}
          >
            <option value="">팀 선택</option>
            {teamList.map((team, idx) => (
              <option key={idx} value={team}>{team}</option>
            ))}
          </select>
        </div>

        <div className="setting-input-row">
          <label className="setting-select-label">투수의 키를 입력하세요(cm):</label>
          <input
            type="text"
            className="setting-input-box"
            value={pitcherHeight}
            onChange={(e) => setPitcherHeight(e.target.value)}
            placeholder="예: 185"
          />
          <p className="setting-input-description">
            입력된 키: {pitcherHeight ? `${pitcherHeight} cm` : "없음"}
          </p>
        </div>

        <div className="setting-select-row">
          <label className="setting-select-label">좌투/우투를 선택하세요.</label>
          <select 
            className="setting-select-box" 
            value={pitchHand} 
            onChange={(e) => setpitchHand(e.target.value)}
          >
            <option value="">좌투/우투 선택</option>
            {pitchHandList.map((type, idx) => (
              <option key={idx} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="setting-select-row">
          <label className="setting-select-label">투구 폼을 선택하세요.</label>
          <select 
            className="setting-select-box" 
            value={pitchForm} 
            onChange={(e) => setpitchForm(e.target.value)}
          >
            <option value="">투구 폼 선택</option>
            {pitchFormList.map((type, idx) => (
              <option key={idx} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="setting-select-row">
          <label className="setting-select-label">상대할 팀을 선택하세요.</label>
          <select 
            className="setting-select-box" 
            value={awayTeam} 
            onChange={(e) => setAwayTeam(e.target.value)}
          >
            <option value="">팀 선택</option>
            {teamList.map((team, idx) => (
              <option key={idx} value={team}>{team}</option>
            ))}
          </select>
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button className="start-game-button" onClick={handleStartGame}>Start Game</button>
      </div>
    </div>
  );
}

export default SettingPage;
