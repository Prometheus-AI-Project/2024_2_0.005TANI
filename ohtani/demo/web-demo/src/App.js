import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartPage from './pages/StartPage/StartPage.js';
import SettingPage from './pages/SettingPage/SettingPage.js';
import PitchingPage from './pages/PitchingPage/PitchingPage.js';
import BattingPage from './pages/BattingPage/BattingPage.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartPage />} /> 
        <Route path="/setting" element={<SettingPage />} />
        <Route path="/pitch" element={<PitchingPage />} />  
        <Route path="/bat" element={<BattingPage />} /> 
      </Routes>
    </Router>
  );
}

export default App;
