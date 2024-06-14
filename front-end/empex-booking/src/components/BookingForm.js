import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const BookingForm = ({ selectedDate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    consultationType: '',
    date: selectedDate ? selectedDate.toISOString().substring(0, 10) : '',
    time: '',
    details: ''
  });

  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    const fetchTimeSlots = async (date) => {
      try {
        const response = await axios.get('http://localhost:5000/api/available-time-slots', {
          params: { date: date.toISOString().substring(0, 10) }
        });
        setTimeSlots(response.data);
      } catch (error) {
        console.error('Error fetching time slots', error);
      }
    };

    if (selectedDate) {
      setFormData(prevFormData => ({
        ...prevFormData,
        date: selectedDate.toISOString().substring(0, 10)
      }));
      fetchTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Booking form data:', formData); // Log form data for debugging
      const response = await axios.post('http://localhost:5000/api/book', formData);
      alert(response.data.message);
    } catch (error) {
      console.error('Error booking appointment:', error.response ? error.response.data : error.message); // Log error for debugging
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
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter your name"
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formPhone">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formConsultationType">
              <Form.Label>Consultation Type</Form.Label>
              <Form.Control
                as="select"
                name="consultationType"
                onChange={handleChange}
                required
              >
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
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formTime">
              <Form.Label>Time</Form.Label>
              <Form.Control
                as="select"
                name="time"
                onChange={handleChange}
                required
              >
                <option value="">Select Time</option>
                {timeSlots.map((time, index) => (
                  <option key={index} value={new Date(time).toTimeString().substring(0, 5)}>
                    {new Date(time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formDetails">
              <Form.Label>Details</Form.Label>
              <Form.Control
                as="textarea"
                name="details"
                placeholder="Details (if any)"
                onChange={handleChange}
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Book Appointment
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default BookingForm;
