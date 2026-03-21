const bcrypt = require('bcrypt');
const User = require('../models/user-models');
const { name } = require('ejs');

exports.registerGet = (req, res) => {
    res.render('register');
}

exports.registerPost = async (req, res) => {
    const { user, email, password, role } = req.body;

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        await User.createUser({ name, email, passwordHash, role: role || 'student', studentId: '', faculty: '', bio: '' });
        res.send('Registered successfully! <a href="/auth/login">Login</a>');
    } catch (err) {
        console.error(err);
        res.send("Registration failed: " + err.message)
    }
}