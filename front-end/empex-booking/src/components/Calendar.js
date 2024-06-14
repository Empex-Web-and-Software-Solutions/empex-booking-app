import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Container, Row, Col } from 'react-bootstrap';

const AvailableSlotsCalendar = ({ onDateSelect, selectedDate }) => {
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/available-slots');
        setAvailableSlots(response.data);
      } catch (error) {
        console.error('Error fetching available slots', error);
      }
    };
    fetchAvailableSlots();
  }, []);

  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const dateString = date.toISOString().substring(0, 10);
      return date < now || date.getDay() === 0 || availableSlots.some(slot => slot.start.date === dateString);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="6">
          <h2 className="mt-4">Available Slots</h2>
          <Calendar
            onChange={onDateSelect}
            value={selectedDate}
            tileDisabled={tileDisabled}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default AvailableSlotsCalendar;
