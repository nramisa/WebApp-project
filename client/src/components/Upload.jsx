import React from 'react';
import styles from '../styles/Analysis.module.css';

const Upload = ({ onUpload, loading }) => {
  const [file, setFile] = React.useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className={styles.uploadCard}>
      <h2>Upload Your Pitch Deck</h2>
      <div className={styles.uploadZone}>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.ppt,.pptx"
        />
        <button
          className={styles.browseBtn}
          onClick={() => onUpload(file)}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Upload File'}
        </button>
      </div>
    </div>
  );
};

export default Upload;
