const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

// Load environment variables from config.env
dotenv.config({ path: './config.env' });

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse URL-encoded bodies (for HTML forms) and serve static files
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Enables session handling for user authentication.
// Stores user login state across requests using req.session.
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Database Connection
async function connectDB() {
    try {
      // connecting to Database with our config.env file and DB is constant in config.env
        await mongoose.connect(process.env.DB);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
  };

// ==========================================
// ROUTE MOUNTING (Placeholders for your team)
// ==========================================
// const authRoutes = require('./routes/auth-routes');
const eventRoutes = require('./routes/events-routes');
const userRoutes = require('./routes/user-routes');
const authRoutes = require('./routes/auth-routes');

// app.use('/auth', authRoutes);
app.use('/events', eventRoutes); //UserProfile - Added Route
app.use('/auth', authRoutes);
app.use('/', userRoutes);

// Temporary Home Page Route
app.get('/', (req, res) => {
    res.render('/'); });

// UserProfile - Added temporary test login route (REMOVE before submission)
// This simulates a logged-in user by manually setting req.session.userId
app.get('/test-login', async (req, res) => {
  try {
    const User = require('./models/user-models');

    // Get any existing user from the database
    const user = await User.findOne();

    if (!user) {
      return res.send("No user found in database. Please create a user first.");
    }
    // Manually set session userId
    req.session.userId = user._id;
    res.redirect('/profile');

  } catch (err) {
    console.error(err);
    res.send("Error during test login");
  }
});

// Start Server
const PORT = process.env.PORT || 8000;

// Call connectDB then start the server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});