import React from 'react';
import { Container, Table, Badge } from 'react-bootstrap';
import { Card } from 'react-bootstrap';

const AdminPanel = () => {
  return (
    <Container className="py-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      <Card className="shadow-sm">
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Dynamic content */}
              <tr>
                <td>startup@example.com</td>
                <td><Badge bg="secondary">Startup</Badge></td>
                <td>2 hours ago</td>
                <td>
                  <button className="btn btn-sm btn-outline-danger">
                    Manage
                  </button>
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminPanel;
