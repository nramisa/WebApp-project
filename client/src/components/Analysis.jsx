import React from 'react';
import styles from '../styles/Analysis.module.css';

export default function Analysis({ data }) {
  // Fix: directly expect an array, not data.results
  if (!Array.isArray(data)) return null;

  return (
    <div>
      {data.map(({ file, error, analysis }) => {
        if (error) {
          return (
            <div key={file} className="mb-4">
              <h4>{file}</h4>
              <p className="text-danger">Error: {error}</p>
            </div>
          );
        }

        const { structure, marketFit, readiness } = analysis.feedback;
        const filled = [structure, marketFit, readiness].filter(x => !!x).length;
        const score = Math.round((filled / 3) * 100);

        return (
          <div key={analysis._id} className={styles.resultsCard}>
            <div className={styles.resultsHeader}>
              <h2>Analysis Results: {file}</h2>
              <div className={styles.confidenceMeter}>
                <span className={styles.score}>{score}%</span>
                <p>Overall Readiness Score</p>
              </div>
            </div>

            <div className={styles.analysisResults}>
              <section>
                <h3>Structure Analysis</h3>
                <p>{structure || 'No structure feedback available.'}</p>
              </section>
              <section>
                <h3>Market Fit</h3>
                <p>{marketFit || 'No market-fit feedback available.'}</p>
              </section>
              <section>
                <h3>Investor Readiness</h3>
                <p>{readiness || 'No investor-readiness feedback available.'}</p>
              </section>
            </div>
          </div>
        );
      })}
    </div>
  );
}
