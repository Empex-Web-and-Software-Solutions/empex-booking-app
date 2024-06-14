const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

const calendar = google.calendar('v3');
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);
oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const isWithinBookingHours = (date) => {
  const day = date.getDay();
  const hours = date.getHours();
  if (day === 0) return false; // Sunday not available
  if (day === 6) return hours >= 9 && hours < 13; // Saturday 9am to 1pm
  return hours >= 8 && hours < 17; // Monday to Friday 8am to 5pm
};

// Endpoint to fetch available slots
app.get('/api/available-slots', async (req, res) => {
  try {
    const response = await calendar.events.list({
      auth: oauth2Client,
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      timeMax: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    const events = response.data.items;
    const availableSlots = events.filter(event => {
      const eventDate = new Date(event.start.dateTime);
      return event.status !== 'confirmed' && isWithinBookingHours(eventDate);
    });
    res.status(200).json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available slots', error });
  }
});

// New endpoint to fetch available time slots for a specific date
app.get('/api/available-time-slots', async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const response = await calendar.events.list({
      auth: oauth2Client,
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;
    const occupiedSlots = events.map(event => new Date(event.start.dateTime));

    const generateTimeSlots = (date) => {
      const day = date.getDay();
      let startHour, endHour;

      if (day === 6) { // Saturday
        startHour = 9;
        endHour = 13;
      } else { // Monday to Friday
        startHour = 8;
        endHour = 17;
      }

      const slots = [];
      for (let hour = startHour; hour < endHour; hour++) {
        slots.push(new Date(date.setHours(hour, 0, 0, 0)).toISOString());
        slots.push(new Date(date.setHours(hour, 30, 0, 0)).toISOString());
      }
      return slots;
    };

    const availableTimeSlots = generateTimeSlots(new Date(date)).filter(slot => {
      const slotDate = new Date(slot);
      return !occupiedSlots.some(occupied => occupied.getTime() === slotDate.getTime());
    });

    res.status(200).json(availableTimeSlots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available time slots', error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
