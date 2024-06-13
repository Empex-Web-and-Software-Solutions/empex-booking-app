import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    consultationType: '',
    date: '',
    time: '',
    details: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/book', formData);
      alert(response.data.message);
    } catch (error) {
      alert('Error booking appointment');
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="6">
          <h2 className="mt-4">Book an Appointment</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" placeholder="Enter your name" onChange={handleChange} required />
            </Form.Group>

            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" placeholder="Enter your email" onChange={handleChange} required />
            </Form.Group>

            <Form.Group controlId="formPhone">
              <Form.Label>Phone</Form.Label>
              <Form.Control type="tel" name="phone" placeholder="Enter your phone number" onChange={handleChange} required />
            </Form.Group>

            <Form.Group controlId="formConsultationType">
              <Form.Label>Consultation Type</Form.Label>
              <Form.Control as="select" name="consultationType" onChange={handleChange} required>
                <option value="">Select Consultation Type</option>
                <option value="web design and development">Web Design and Development</option>
                <option value="app design and development">App Design and Development</option>
                <option value="e-commerce">E-commerce</option>
                <option value="SEO management">SEO Management</option>
                <option value="other">Other</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formDate">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" name="date" onChange={handleChange} required />
            </Form.Group>

            <Form.Group controlId="formTime">
              <Form.Label>Time</Form.Label>
              <Form.Control type="time" name="time" onChange={handleChange} required />
            </Form.Group>

            <Form.Group controlId="formDetails">
              <Form.Label>Details</Form.Label>
              <Form.Control as="textarea" name="details" placeholder="Details (if any)" onChange={handleChange} />
            </Form.Group>

            <Button variant="primary" type="submit">Book Appointment</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default BookingForm;
