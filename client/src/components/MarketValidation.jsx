import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import axios from 'axios';
import styles from '../styles/Analysis.module.css';

const MarketValidation = () => {
  const [details, setDetails] = useState({
    industry: '',
    description: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { auth } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('/api/market-validation', 
        {
          industry: details.industry,
          description: details.description
        },
        {
          headers: { Authorization: `Bearer ${auth.token}`
        }
      });
      
      setResult(response.data);
    } catch (error) {
      alert('Validation failed: ' + (error.response?.data?.error || 'Server error'));
    }
    setLoading(false);
  };

  return (
    <div className={styles.uploadCard}>
      <h2>Market Validation</h2>
      <div className={styles.uploadZone}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Industry</label>
            <select
              value={details.industry}
              onChange={(e) => setDetails({...details, industry: e.target.value})}
              required
            >
              <option value="">Select Industry</option>
              <option value="tech">Technology</option>
              <option value="fintech">Fintech</option>
              <option value="healthcare">Healthcare</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Business Description</label>
            <textarea
              value={details.description}
              onChange={(e) => setDetails({...details, description: e.target.value})}
              required
              rows="4"
            />
          </div>

          <button 
            className={styles.browseBtn} 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Validate Market'}
          </button>
        </form>

        {result && (
          <div className={styles.confidenceMeter}>
            <h3>Market Validation Report</h3>
            <div className={styles.score}>{result.marketSize} Bn USD Market</div>
            <p>Competition Level: {result.competitionLevel}</p>
            <p>Uniqueness Score: {result.uniquenessScore}/100</p>
            <div className={styles.analysisResults}>
              <p>{result.validationSummary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketValidation;
