import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import HomePage from './components/HomePage';
import SignUpPage from './components/SignUpPage';
import LoginPage from './components/LoginPage';
import SearchPage from './components/SearchPage';
import ComparePage from './components/ComparePage';
import ESGMetricsChart from './components/esg_graph';
import ESGDetails from './components/esg-details-complete';
import ESGScores from './components/esg-scores';
import FrameworkPage from './components/FrameworkPage';

function App() {
  const [framework, setFramework] = useState('');
  const [customizedWeightLocal, setCustomizedWeightLocal] = useState({ ew: '', sw: '', gw: '' });
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/search" element={<SearchPage/>}/>
        <Route path="/compare" element={<ComparePage framework={framework} customizedWeightLocal={customizedWeightLocal}/>} />
        <Route path="/frameworks" element={<FrameworkPage 
        framework={framework}
        setFramework={setFramework}
        customizedWeightLocal={customizedWeightLocal}
        setCustomizedWeightLocal={setCustomizedWeightLocal}/>} />
        <Route path="/esgdetails/:perm_id" element={<ESGDetails />} />
        <Route path="/esgscore/:perm_id" element={<ESGScores />} />
        <Route path="/esggraph/:perm_id" element={<ESGMetricsChart />} />
      </Routes>
    </Router>
  );
}

export default App;