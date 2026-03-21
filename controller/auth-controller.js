const bcrypt = require('bcrypt');
const User = require('../models/user-models');

exports.registerGet = (req, res) => {
    res.render('register', { errors: [] });
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
        await User.create({ name, email, passwordHash, role: role || 'student', studentId: '', faculty: '', bio: '' });
        res.send('Registered successfully! <a href="/auth/login">Login</a>');
    } catch (err) {
        console.error(err);
        res.send("Registration failed: " + err.message)
    }
}

exports.loginGet = (req, res) => {
    res.render('login', { errors: [] });
}

exports.loginPost = async (req, res) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email) {
        errors.push('Please enter an email');
    }
    if (!password) {
        errors.push('Passwords is required');
    }

    if (errors.length > 0) {
        return res.render('login', { errors });
    }

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            errors.push("Invalid email or password.")
            return res.render('login', { errors });
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            errors.push('Invalid email or password.');
            return res.render('login', { errors });
        }

        req.session.userId   = user._id;
        req.session.userName = user.name;
        req.session.role     = user.role;

        if (user.role === "admin") {
            return res.redirect('/admin/dashboard');
        }

        res.redirect('/events/list');
    } catch (err) {
        console.error(err);
        res.render('login', { errors: ['Login failed. Please try again.']});
    }
}

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
}