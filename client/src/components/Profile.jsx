import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, ListGroup } from 'react-bootstrap';
import styles from '../styles/Analysis.module.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    
    // Mock analyses - in a real app, this would come from your backend
    const mockAnalyses = [
      { id: 1, date: '2024-05-01', score: 82, summary: 'Strong team section but needs financial projections' },
      { id: 2, date: '2024-04-15', score: 75, summary: 'Good problem identification but lacks competitor analysis' }
    ];
    setAnalyses(mockAnalyses);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className={styles.uploadCard}>
      <Card className="shadow-lg border-0">
        <Card.Body className="p-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Your Profile</h2>
            <Button variant="outline-danger" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
          
          <div className="mb-5">
            <h4>Account Information</h4>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Startup:</strong> {user.startupName}</p>
          </div>
          
          <h4 className="mb-3">Your Analyses</h4>
          {analyses.length > 0 ? (
            <ListGroup>
              {analyses.map(analysis => (
                <ListGroup.Item key={analysis.id} className="mb-2">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h5>Analysis from {analysis.date}</h5>
                      <p className="mb-0">{analysis.summary}</p>
                    </div>
                    <div className="text-danger fw-bold">
                      {analysis.score}%
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p>No analyses yet. Upload your first pitch deck to get started!</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Profile;
