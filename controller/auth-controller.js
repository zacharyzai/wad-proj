const bcrypt = require('bcrypt');
const User = require('../models/user-models');
exports.registerGet = (req, res) => {
    res.render('register', { errors });
}

exports.registerPost = async (req, res) => {
    const { name, email, password, role } = req.body;
    const errors = [];
    if (!name || name.trim().length === 0) {
        errors.push('Name is required.');
    }
    if (!email || !email.includes('@')) {
        errors.push('Please enter a valid email');
    }
    if (!password || password.trim().length < 6 ) {
        errors.push('Passwords requires minimum of 6 characters');
    }

    if (errors.length > 0) {
        return res.render('register', { errors });
    }
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        await User.createUser({ name, email, passwordHash, role: role || 'student', studentId: '', faculty: '', bio: '' });
        res.send('Registered successfully! <a href="/auth/login">Login</a>');
    } catch (err) {
        console.error(err);
        res.send("Registration failed: " + err.message)
    }
}