import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './components/Home';
import Analysis from './components/Analysis';
import MarketValidation from './components/MarketValidation';
import InvestorQA from './components/InvestorQA';
import Upload from './components/Upload';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/market-validation" element={<MarketValidation />} />
          <Route path="/investor-qa" element={<InvestorQA />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
