import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartPage from './pages/StartPage/StartPage.js';
import SettingPage from './pages/SettingPage/SettingPage.js';
import PitchingPage from './pages/PitchingPage/PitchingPage.js';
import BattingPage from './pages/BattingPage/BattingPage.js';
import EndingPage from './pages/EndingPage/EndingPage.js';

import HomerunPage from './pages/ResultPage/HomerunPage.js';
import HitPage from './pages/ResultPage/HitPage.js';
import FoulPage from './pages/ResultPage/FoulPage.js';
import StrikePage from './pages/ResultPage/StrikePage.js';
import BallPage from './pages/ResultPage/BallPage.js';
import OutPage from './pages/ResultPage/OutPage.js';





function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartPage />} /> 
        <Route path="/setting" element={<SettingPage />} />
        <Route path="/pitch" element={<PitchingPage />} />  
        <Route path="/bat" element={<BattingPage />} /> 
        <Route path="/end" element={<EndingPage />} />
        <Route path="/homerun" element={<HomerunPage />} />
        <Route path="/foul" element={<FoulPage />} />
        <Route path="/strike" element={<StrikePage />} />
        <Route path="/ball" element={<BallPage />} />
        <Route path="/out" element={<OutPage />} />
        <Route path="/hit" element={<HitPage />} />


      </Routes>
    </Router>
  );
}

export default App;
