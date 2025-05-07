import React from 'react';



import styles from '../styles/Analysis.module.css';





const Analysis = ({ data }) => {


  return (


    <div className={styles.resultsCard}>


      <div className={styles.resultsHeader}>


        <h2>Analysis Results</h2>


        <div className={styles.confidenceMeter}>


          <span className={styles.score}>82%</span>


          <p>Overall Readiness Score</p>


        </div>


      </div>





      <div className={styles.analysisResults}>


        <section>


          <h3>Structure Analysis</h3>


          <p>Your deck needs stronger financial projections...</p>


        </section>


        <section>


          <h3>Market Fit</h3>


          <p>Clear problem identification but needs more competitor analysis...</p>


        </section>


        <section>


          <h3>Investor Readiness</h3>


          <p>Strong team section but missing exit strategy...</p>


        </section>


      </div>


    </div>


  );


};





export default Analysis;
