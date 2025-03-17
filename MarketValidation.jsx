import React, { useState } from 'react';
import styles from '../styles/Analysis.module.css';

const MarketValidation = () => {
  const [startupDetails, setStartupDetails] = useState({
    name: '',
    industry: '',
    targetMarket: '',
    uniqueValue: ''
  });

  const [score, setScore] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mockScore = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
    setScore(mockScore);
  };

  return (
    <div className={styles.uploadCard}>
      <h2>Market Validation</h2>
      <div className={styles.uploadZone}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Startup Name</label>
            <input
              type="text"
              value={startupDetails.name}
              onChange={(e) => setStartupDetails({...startupDetails, name: e.target.value})}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Industry</label>
            <select
              value={startupDetails.industry}
              onChange={(e) => setStartupDetails({...startupDetails, industry: e.target.value})}
              required
            >
              <option value="">Select Industry</option>
              <option value="fintech">Fintech</option>
              <option value="healthtech">Healthtech</option>
              <option value="edtech">Edtech</option>
            </select>
          </div>

          <button className={styles.browseBtn} type="submit">
            Validate Market Fit
          </button>
        </form>

        {score && (
          <div className={styles.confidenceMeter}>
            <h3>Market Validation Score</h3>
            <div className={styles.score}>{score}%</div>
            <p>Success Likelihood Prediction</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketValidation;