import React, { useState } from 'react';
import './SettingPage.css';
import field from '../../assets/img/background/field.jpg';


function SettingPage() {

  const [homeTeam, setHomeTeam] = useState('');
  const [pitcher, setPitcher] = useState('');
  const [pitcherHeight, setPitcherHeight] = useState('');
  const [pitchBatType, setPitchBatType] = useState('');
  const [awayTeam, setAwayTeam] = useState('');


  const teamList = ['기아 타이거즈','삼성 라이온즈', 'LG 트윈스', '두산 베어스','KT 위즈','SSG 랜더스','롯데 자이언츠','한화 이글스','NC 다이노스', '키움 히어로즈'];
  const pitcherList = ['양현종','오승환','손주영','곽빈','엄상백','김광현', '박세웅', '류현진','하트','하영민']; 
  const pitchBatTypeList = ['좌투좌타', '좌투우타','우투좌타','우투우타']
  return (
    <div className="setting-page-container">
      {/* 왼쪽: 설정(드롭다운) 영역 */}
      <div className="setting-select-area">
        <div className="setting-select-row">
          <label className="setting-select-label">경기할 팀을 선택하세요.</label>
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

        
        <div className="setting-select-row">
          <label className="setting-select-label">투수를 선택하세요.</label>
          <select 
            className="setting-select-box" 
            value={pitcher} 
            onChange={(e) => setPitcher(e.target.value)}
          >
            <option value="">선수 선택</option>
            {pitcherList.map((p, idx) => (
              <option key={idx} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="setting-input-row">
          <label className="setting-select-label">투수의 키를 입력하세요(cm):</label>
          <input
            type="text"
            className="setting-input-box"
            value={pitcherHeight}
            onChange={(e)=>setPitcherHeight(e.target.value)}
            placholder="예: 185"
          />
          <p className="setting-input-description">
            입력된 키: {pitcherHeight ? `${pitcherHeight} cm` : "없음"}
          </p>
        </div>

        <div className="setting-select-row">
          <label className="setting-select-label">투타형을 선택하세요.</label>
          <select 
            className="setting-select-box" 
            value={pitchBatType} 
            onChange={(e) => setPitchBatType(e.target.value)}
          >
            <option value="">투타형 선택</option>
            {pitchBatTypeList.map((type, idx) => (
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
      </div>

      {/* 
      <div className="setting-stadium-area"> 
        <div 
          className="setting-stadium-dummy"
          style={{
            backgroundImage: `url(${field})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          
          ></div>
      </div>
      */}
    </div>
  );
}

export default SettingPage;
