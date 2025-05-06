import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Card, ListGroup, Spinner } from 'react-bootstrap';
import { AuthContext } from './context/AuthContext';

const Profile = () => {
  const { auth, api } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/api/users/${auth.userData.id}`);
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="danger" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-center">
                <div className="mb-3">
                  <i className="bi bi-person-circle fs-1 text-danger"></i>
                </div>
                <h3>{userData.profile.name}</h3>
                <p className="text-muted">{userData.email}</p>
              </div>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <i className="bi bi-building me-2"></i>
                  {userData.profile.industry || 'No industry specified'}
                </ListGroup.Item>
                <ListGroup.Item>
                  <i className="bi bi-globe me-2"></i>
                  {userData.profile.website || 'No website'}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Analysis History</Card.Title>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Score</th>
                      <th>Feedback Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.analyses.map((analysis, index) => (
                      <tr key={index}>
                        <td>{new Date(analysis.date).toLocaleDateString()}</td>
                        <td>
                          <span className="badge bg-danger">
                            {analysis.score}%
                          </span>
                        </td>
                        <td>{analysis.feedback.substring(0, 50)}...</td>
                      </tr>
                    ))}
                    {userData.analyses.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center text-muted py-4">
                          No analysis history found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
