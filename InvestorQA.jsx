import React, { useState } from 'react';
import styles from '../styles/Analysis.module.css';

const InvestorQA = () => {
  const [investorType, setInvestorType] = useState('vc');
  const [fundingStage, setFundingStage] = useState('seed');
  const [questions, setQuestions] = useState([]);

  const generateQuestions = async () => {
    const mockQuestions = [
      "What's your customer acquisition cost?",
      "How does your solution differ from existing options?",
      "What's your 5-year growth projection?",
    ];
    setQuestions(mockQuestions);
  };

  return (
    <div className={styles.uploadCard}>
      <h2>Investor Q&A Simulator</h2>
      <div className={styles.uploadZone}>
        <select 
          value={investorType}
          onChange={(e) => setInvestorType(e.target.value)}
        >
          <option value="vc">Venture Capital</option>
          <option value="angel">Angel Investor</option>
          <option value="corporate">Corporate VC</option>
        </select>

        <div className="stage-selector">
          {['pre-seed', 'seed', 'series-a'].map(stage => (
            <button
              key={stage}
              className={fundingStage === stage ? styles.activeStage : ''}
              onClick={() => setFundingStage(stage)}
            >
              {stage.toUpperCase()}
            </button>
          ))}
        </div>

        <button className={styles.browseBtn} onClick={generateQuestions}>
          Generate Questions
        </button>

        <div className="questions-section">
          {questions.map((q, i) => (
            <div key={i} className="question-card">
              <p>{q}</p>
              <button className="practice-btn">Practice Answer</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvestorQA;