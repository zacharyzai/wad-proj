const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

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
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connection successful!'))
    .catch((err) => console.error('MongoDB connection error:', err));

// ==========================================
// ROUTE MOUNTING (Placeholders for your team)
// ==========================================
// const authRoutes = require('./routes/auth-routes');
// const eventRoutes = require('./routes/event-routes');
// const profileRoutes = require('./routes/profile-routes');

// app.use('/auth', authRoutes);
// app.use('/events', eventRoutes);
// app.use('/profile', profileRoutes);

// Temporary Home Page Route
app.get('/', (req, res) => {
    res.render('index'); 
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});