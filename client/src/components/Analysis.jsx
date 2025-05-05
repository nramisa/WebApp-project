import React from 'react';
import styles from '../styles/Analysis.module.css';

const Analysis = ({ data }) => {
  if (!data) return null;

  return (
    <div className={styles.resultsCard}>
      <div className={styles.resultsHeader}>
        <h2>AI Analysis Results</h2>
        <div className={styles.confidenceMeter}>
          <span className={styles.score}>{data.overallScore}%</span>
          <p>Overall Readiness Score</p>
        </div>
      </div>

      <div className={styles.analysisResults}>
        <section>
          <h3>Structure Analysis</h3>
          <p>{data.structureSummary}</p>
        </section>
        
        <section>
          <h3>Market Fit ({data.marketFitScore}/100)</h3>
          <p>{data.marketFitScore >= 70 ? '✅ Strong' : '⚠️ Needs Improvement'}</p>
        </section>

        <section>
          <h3>Investor Readiness ({data.investorReadinessScore}/100)</h3>
          <p>{data.investorReadinessScore >= 80 ? '🎯 Investor Ready' : '📈 Needs Refinement'}</p>
        </section>

        <section>
          <h3>Financial Health</h3>
          <p>{data.financialHealth}</p>
        </section>
      </div>
    </div>
  );
};

export default Analysis;
