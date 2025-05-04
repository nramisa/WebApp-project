import React, { useContext, useEffect, useState } from 'react'; // Fixed: Added useState import
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap'; // Added Spinner
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const StartupDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Added error handling

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/startup-data', {
          headers: { 
            Authorization: `Bearer ${auth.token}` 
          }
        });
        setData(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (auth.token) { // Added conditional check
      fetchData();
    }
  }, [auth.token]); // Added proper dependency array

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center mt-5 text-danger">
        {error}
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2>Welcome {auth.userData?.name || 'User'}</h2> {/* Safer null-check */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body>
              {data ? (
                // Render your actual dashboard content here
                <div>
                  <h4>Your Pitch Documents</h4>
                  <p>{data.documentsCount} uploaded files</p>
                </div>
              ) : (
                <p>No data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StartupDashboard;
