// Middleware to check if user is logged in

function isAuthenticated(req, res, next) {
  // req.session.userId is set during login (by login/register teammate)
  if (!req.session.userId) {
    return res.send("Please login first");
  }

  // If user is logged in, proceed to next function
  next();
}

module.exports = isAuthenticated;