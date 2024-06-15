import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BookingForm from './components/BookingForm';
import AvailableSlotsCalendar from './components/Calendar';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import './App.css';

const App = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleDateClear = () => {
    setSelectedDate(null);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <AvailableSlotsCalendar onDateSelect={handleDateSelect} selectedDate={selectedDate} />
                <BookingForm selectedDate={selectedDate} onDateClear={handleDateClear} />
              </>
            }
          />
          <Route path="/admin" element={isAuth ? <AdminDashboard /> : <AdminLogin setAuth={setIsAuth} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
