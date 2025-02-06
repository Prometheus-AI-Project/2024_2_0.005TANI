// src/pages/Homerun.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import homerunGif from '../../assets/img/background/homerun.gif';
const HomerunPage = () => {
  const navigate = useNavigate();

  //영상 재생 후 원래 페이지로 돌아가기. 
  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/bat');
    }, 5000); // 5초 후 이동

    return () => clearTimeout(timer);
  }, [navigate]);


  return (
    <div style={{ textAlign: 'center' }}>
      <h2>홈런입니다!</h2>
      
      {/* GIF 파일 표시 */}
      <img
        src={homerunGif}
        alt="홈런 애니메이션"
        width="640"
        style={{ margin: '20px auto', display: 'block' }}
      />

      <button onClick={() => navigate('/pitch')}>
        투구 페이지로 돌아가기
      </button>
    </div>
  );
};

export default HomerunPage;
