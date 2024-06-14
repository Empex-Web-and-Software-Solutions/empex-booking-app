import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Container, Row, Col } from 'react-bootstrap';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/bookings');
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings', error);
      }
    };
    fetchBookings();
  }, []);

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="10">
          <h2 className="mt-4">Admin Dashboard</h2>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Consultation Type</th>
                <th>Date</th>
                <th>Time</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => (
                <tr key={index}>
                  <td>{booking.name}</td>
                  <td>{booking.email}</td>
                  <td>{booking.phone}</td>
                  <td>{booking.consultationType}</td>
                  <td>{new Date(booking.date).toLocaleDateString()}</td>
                  <td>{new Date(booking.time).toLocaleTimeString()}</td>
                  <td>{booking.details}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
