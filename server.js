const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from config.env
dotenv.config({ path: './config.env' });

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse URL-encoded bodies (for HTML forms) and serve static files
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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
// const profileRoutes = require('./routes/profile-routes');

// app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
// app.use('/profile', profileRoutes);

// Temporary Home Page Route
app.get('/', (req, res) => {
    res.render('/'); 
});

// Start Server
const PORT = process.env.PORT || 8000;

// Call connectDB then start the server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});