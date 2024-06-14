import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import './BookingForm.css';


const BookingForm = ({ selectedDate, onDateClear }) => {
  const initialFormData = {
    name: '',
    email: '',
    phone: '',
    consultationType: '',
    date: selectedDate ? selectedDate.toISOString().substring(0, 10) : '',
    time: '',
    details: ''
  };

  const [formData, setFormData] = useState(initialFormData);
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
      const utcDate = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()));
      setFormData(prevFormData => ({
        ...prevFormData,
        date: utcDate.toISOString().substring(0, 10)
      }));
      fetchTimeSlots(utcDate);
    } else {
      setFormData(initialFormData);
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

      // Clear form data and date selection
      setFormData(initialFormData);
      onDateClear();
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
                value={formData.name}
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
                value={formData.email}
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
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formConsultationType">
              <Form.Label>Consultation Type</Form.Label>
              <Form.Control
                as="select"
                name="consultationType"
                value={formData.consultationType}
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
                value={formData.time}
                onChange={handleChange}
                required
              >
                <option value="">Select Time</option>
                {timeSlots.map((slot, index) => (
                  <option key={index} value={new Date(slot.time).toTimeString().substring(0, 5)} className={slot.isBooked ? 'booked' : ''} disabled={slot.isBooked}>
                    {new Date(slot.time).toLocaleTimeString([], {
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
                value={formData.details}
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
