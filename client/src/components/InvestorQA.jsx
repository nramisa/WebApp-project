import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import axios from 'axios';
import styles from '../styles/Analysis.module.css';

const InvestorQA = () => {
  const [industry, setIndustry] = useState('tech');
  const [stage, setStage] = useState('seed');
  const [qaPairs, setQAPairs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { auth } = useContext(AuthContext);

  const generateQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/generate-questions', 
        { industry, stage },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setQAPairs(response.data);
    } catch (error) {
      alert('Failed to generate questions');
    }
    setIsLoading(false);
  };

  return (
    <div className={styles.uploadCard}>
      <h2>Investor Q&A Generator</h2>
      <div className={styles.uploadZone}>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className={styles.formSelect}
        >
          <option value="tech">Technology</option>
          <option value="healthcare">Healthcare</option>
          <option value="fintech">Fintech</option>
        </select>

        <div className={styles.stageSelector}>
          {['pre-seed', 'seed', 'series-a'].map((s) => (
            <button
              key={s}
              className={`${styles.stageButton} ${stage === s ? styles.activeStage : ''}`}
              onClick={() => setStage(s)}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        <button 
          className={styles.browseBtn} 
          onClick={generateQuestions}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Q&A'}
        </button>

        <div className={styles.qaSection}>
          {qaPairs.map((pair, index) => (
            <div key={index} className={styles.qaCard}>
              <h4>Question {index + 1}</h4>
              <p className={styles.question}>{pair.question}</p>
              <div className={styles.answer}>
                <strong>Suggested Answer:</strong>
                <p>{pair.suggestedAnswer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvestorQA;
