const User = require("../models/user-models");

exports.showDashboard = async (req, res) => {
  try {
    const users = await User.find();

    res.render("admin/dashboard", {
      users,
      events: [], // rmb to update when events is done!
      totalRSVPs: 0, // rmb to update when rsvp is done!
      userName: req.session.userName,
      currentUserId: req.session.userId.toString(),
    });
  } catch (err) {
    console.error(err);
    res.send("Error loading dashboard.");
  }
};

exports.showEditUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.send("User not found.");
    }

    res.render("admin/edit-user", {
      user,
      errors: [],
    });
  } catch (err) {
    console.error(err);
    res.send("Error loading edit form.");
  }
};

exports.handleEditUser = async (req, res) => {
  const { name, email, role } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push("Name is required.");
  }

  if (!email || !email.includes("@")) {
    errors.push("Valid email is required.");
  }
  if (!role) {
    errors.push("Role is required.");
  }

  if (errors.length > 0) {
    const user = await User.findById(req.params.id);
    return res.render("admin/edit-user", { user, errors });
  }

  try {
    await User.findByIdAndUpdate(req.params.id, { name, email, role });
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.send("Error updating user.");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.session.userId.toString()) {
      return res.redirect("/admin/dashboard");
    }

    await User.findByIdAndDelete(req.params.id);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.send("Error deleting user.");
  }
};
