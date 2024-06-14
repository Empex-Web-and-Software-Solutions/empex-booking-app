import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import { Container, Row, Col } from 'react-bootstrap';

const AvailableSlotsCalendar = ({ onDateSelect }) => {
  const [date, setDate] = useState(new Date());
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
    // Disable Sundays
    return view === 'month' && date.getDay() === 0;
  };

  const handleDateChange = (selectedDate) => {
    const localDate = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000));
    setDate(localDate);
    onDateSelect(localDate);
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="6">
          <h2 className="mt-4">Available Slots</h2>
          <Calendar
            onChange={handleDateChange}
            value={date}
            tileDisabled={tileDisabled}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default AvailableSlotsCalendar;
