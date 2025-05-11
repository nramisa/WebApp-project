import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';

export default function EditProfileForm({ initial, onSave, loading, onCancel }) {
  const [form, setForm] = useState(initial);
  const [err, setErr] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setErr('Both fields are required');
      return;
    }
    setErr('');
    onSave(form);
  };

  return (
    <Form onSubmit={handleSubmit} className="mt-4">
      {err && <p className="text-danger">{err}</p>}
      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        />
      </Form.Group>
      <div className="d-flex justify-content-end">
        <Button variant="secondary" onClick={onCancel} disabled={loading} className="me-2">
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : 'Save'}
        </Button>
      </div>
    </Form>
  );
}
