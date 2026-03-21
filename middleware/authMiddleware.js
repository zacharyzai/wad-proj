// Middleware to check if user is logged in

function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
}

module.exports = isAuthenticated;