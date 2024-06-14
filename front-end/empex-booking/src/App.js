import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BookingForm from './components/BookingForm';
import AvailableSlotsCalendar from './components/Calendar';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

const App = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <AvailableSlotsCalendar onDateSelect={handleDateSelect} />
                <BookingForm selectedDate={selectedDate} />
              </>
            }
          />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
