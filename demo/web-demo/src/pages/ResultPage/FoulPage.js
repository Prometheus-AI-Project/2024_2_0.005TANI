import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FOUL from '../../assets/img/background/FOUL.png'; // OUT 이미지 import
import BATTER from '../../assets/img/background/batter.png'; // 배경 이미지 import
import './OutPage.css';

function FoulPage() {

  const navigate = useNavigate();
  const location = useLocation();
  
  // 이전 페이지에서 넘어온 데이터 (점수, 아웃, 주자 등) 유지
  const gameState = location.state || {};

  // 2초 후 자동으로 원래 페이지로 돌아가기
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(-1); // 이전 페이지로 돌아가기
    }, 2000); // 2초 후 복귀

    return () => clearTimeout(timer); // 언마운트 시 타이머 정리
  }, [navigate]);


  return (
    <div className="out-page">
      <div className="background"></div> {/* 흐림 효과 추가된 배경 */}
      <img src={FOUL} alt="OUT text" className="out-text" />
    </div>
  );
}

export default FoulPage;
