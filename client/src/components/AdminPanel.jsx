import React, { useContext, useEffect, useState } from 'react';
import { Container, Table, Badge, Spinner } from 'react-bootstrap';
import { AuthContext } from './context/AuthContext';

const AdminPanel = () => {
  const { api } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Container className="py-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="danger" />
        </div>
      ) : (
        <div className="table-responsive">
          <Table striped hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Analyses</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.profile.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <Badge bg={user.role === 'admin' ? 'danger' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td>{user.analyses.length}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default AdminPanel;
