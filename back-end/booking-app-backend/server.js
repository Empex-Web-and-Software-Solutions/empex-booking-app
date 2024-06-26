const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

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

const path = require('path');

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});


app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      return res.status(200).json({ message: 'Login successful' });
    } else {
      return res.status(401).json({ message: 'Invalid password' });
    }
  });

app.get('/api/appointments', async (req, res) => {
    try {
      console.log('Fetching appointments...');
      const response = await calendar.events.list({
        auth: oauth2Client,
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });
  
      console.log('Appointments fetched:', response.data.items);
  
      const appointments = response.data.items.map(event => {
        console.log('Processing event:', event);
  
        const descriptionParts = event.description ? event.description.split('\n') : [];
        const phone = descriptionParts.length > 1 ? descriptionParts[1].split(': ')[1] : '';
  
        // Handle cases where dateTime might be missing or invalid
        let dateTime;
        try {
          dateTime = new Date(event.start.dateTime);
          if (isNaN(dateTime.getTime())) throw new Error('Invalid date');
        } catch (error) {
          console.error(`Invalid dateTime for event ${event.id}:`, event.start);
          dateTime = null;
        }
  
        if (!dateTime) return null;
  
        return {
          id: event.id,
          name: event.summary.split(' - ')[0],
          email: event.attendees && event.attendees.length > 0 ? event.attendees[0].email : '',
          phone,
          date: dateTime.toISOString().substring(0, 10),
          time: dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          consultationType: event.summary.split(' - ')[1],
        };
      }).filter(Boolean); // Filter out any null values
  
      console.log('Formatted appointments:', appointments);
      res.status(200).json(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
  });
  
  app.delete('/api/appointments/:id', async (req, res) => {
    const { id } = req.params;
    try {
      console.log('Cancelling appointment with id:', id);
      await calendar.events.delete({
        auth: oauth2Client,
        calendarId: 'primary',
        eventId: id,
      });
      res.status(200).json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
    }
  });
  

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
      const eventDate = new Date(event.start.dateTime || event.start.date);
      return event.status !== 'confirmed' && isWithinBookingHours(eventDate);
    });
    res.status(200).json(availableSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ message: 'Error fetching available slots', error });
  }
});

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
    console.log('Events:', events); // Log events for debugging
    const occupiedSlots = events.flatMap(event => {
      const startTime = new Date(event.start.dateTime || event.start.date);
      const halfHourLater = new Date(startTime.getTime() + 30 * 60 * 1000);
      return [startTime.toISOString(), halfHourLater.toISOString()];
    });

    const availableTimeSlots = generateTimeSlots(new Date(date)).map(slot => {
      console.log('Generated Slot:', slot); // Log each generated slot
      return {
        time: slot,
        isBooked: occupiedSlots.includes(slot),
      };
    });

    res.status(200).json(availableTimeSlots);
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    res.status(500).json({ message: 'Error fetching available time slots', error });
  }
});

app.post('/api/book', async (req, res) => {
  const { name, email, phone, consultationType, date, time, details } = req.body;

  if (!name || !email || !phone || !consultationType || !date || !time) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const startDateTime = new Date(`${date}T${time}:00.000Z`);
    if (isNaN(startDateTime.getTime())) {
      throw new Error(`Invalid start date and time: ${date}T${time}`);
    }

    // Adjust for local time zone if necessary
    const localStartDateTime = new Date(startDateTime.getTime() + startDateTime.getTimezoneOffset() * 60000);
    const endDateTime = new Date(localStartDateTime.getTime() + 60 * 60 * 1000); 

    const event = {
      summary: `${name} - ${consultationType}`,
      description: `Email: ${email}\nPhone: ${phone}\nConsultation Type: ${consultationType}\nDetails: ${details}`,
      start: {
        dateTime: localStartDateTime.toISOString(),
        timeZone: 'UTC', 
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'UTC', 
      },
      attendees: [{ email }],
    };

    console.log('Booking event:', event); // Log event details for debugging

    await calendar.events.insert({
      auth: oauth2Client,
      calendarId: 'primary',
      resource: event,
    });

    res.status(200).json({ message: 'Appointment booked successfully' });
  } catch (error) {
    console.error('Error booking appointment:', error.message, error.stack); // Log detailed error message and stack trace
    res.status(500).json({ message: 'Error booking appointment', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
