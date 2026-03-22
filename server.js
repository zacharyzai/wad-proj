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
app.use(express.static(path.join(__dirname)));

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
const { isAuthenticated, isAdmin } = require('./middleware/authMiddleware');

// import routes
const authRoutes = require('./routes/auth-routes');
const eventRoutes = require('./routes/events-routes');
const userRoutes = require('./routes/user-routes');
const adminRoutes = require('./routes/admin-routes');

// mount routes
app.use('/auth', authRoutes);
app.use('/events', isAuthenticated, eventRoutes);
app.use('/profile', isAuthenticated, userRoutes);
app.use('/admin', isAdmin, adminRoutes);

app.get('/', (req, res) => {
    res.render('/events/create-event'); 
    res.redirect('/auth/login');
});

// Start Server
const PORT = process.env.PORT || 8000;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});