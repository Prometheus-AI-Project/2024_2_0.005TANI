import React from 'react';
import OUT from '../../assets/img/background/OUT.png'; // OUT 이미지 import
import BATTER from '../../assets/img/background/batter.png'; // 배경 이미지 import
import './OutPage.css';

function OutPage() {
  return (
    <div className="out-page">
      <div className="background"></div> {/* 흐림 효과 추가된 배경 */}
      <img src={OUT} alt="OUT text" className="out-text" />
    </div>
  );
}

export default OutPage;
