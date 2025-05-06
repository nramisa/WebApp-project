import React, { useContext } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext.jsx';

const Upload = ({ onUpload, loading }) => {
  const [file, setFile] = React.useState(null);
  const { auth } = useContext(AuthContext);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <Card className="shadow-lg border-0 my-4">
      <Card.Body className="p-5">
        <h2 className="mb-4">Upload Your Pitch Deck</h2>
        <Form>
          <Form.Group controlId="formFile" className="mb-4">
            <Form.Label>Select File (PDF/DOC/PPT)</Form.Label>
            <Form.Control 
              type="file" 
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx" 
            />
          </Form.Group>
          <Button 
            variant="danger" 
            onClick={() => onUpload(file)}
            disabled={!file || loading || !auth.token}
            className="w-100 py-3"
          >
            {loading ? 'Analyzing...' : 'Upload File'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Upload;
