// check if user is logged in
exports.isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    next();
};

// check if user is admin
exports.isAdmin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    if (req.session.role !== 'admin') {
        return res.redirect('/');
    }
    next();
};

// check if user is organizer or admin
exports.isOrganizer = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    if (req.session.role !== 'organizer' && req.session.role !== 'admin') {
        return res.redirect('/');
    }
    next();
};