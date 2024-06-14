// src/App.js
import React, { useState } from 'react';
import BookingForm from './components/BookingForm';
import AvailableSlotsCalendar from './components/Calendar';
import './App.css';

const App = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="App">
      <AvailableSlotsCalendar onDateSelect={handleDateSelect} />
      <BookingForm selectedDate={selectedDate} />
    </div>
  );
};

export default App;
