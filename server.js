const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');

dotenv.config({ path: './config.env' });

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Enables session handling for user authentication.
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
  saveUninitialized: false
}));

// Database Connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.DB);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
  };

// middlewares
const { isAuthenticated, isAdmin, isOrganizer } = require('./middleware/authMiddleware');
const { attachUnreadCount } = require('./middleware/notificationMiddleware');

app.use(attachUnreadCount);

// import routes
const authRoutes = require('./routes/auth-routes');
const eventRoutes = require('./routes/events-routes');
const userRoutes = require('./routes/user-routes');
const adminRoutes = require('./routes/admin-routes');
const reviewRoutes = require('./routes/review-routes');
const organizerRoutes = require('./routes/organizer-routes');
const rsvpRoutes = require('./routes/rsvp-routes');
const notificationRoutes = require('./routes/notification-routes');

// mount routes
app.use('/auth', authRoutes);
app.use('/organizer', isOrganizer, organizerRoutes)
app.use('/events', isAuthenticated, reviewRoutes);
app.use("/rsvp", isAuthenticated, rsvpRoutes);
app.use('/events', isAuthenticated, eventRoutes);
app.use('/profile', isAuthenticated, userRoutes);
app.use('/admin', isAdmin, adminRoutes);
app.use('/notifications', isAuthenticated, notificationRoutes);


app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Start Server
const PORT = process.env.PORT || 8000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});