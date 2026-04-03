const bcrypt = require("bcrypt");
const User = require("../models/user-models");
const Event = require("../models/event-models");
const { deleteUserCascade } = require("../services/userServices");

exports.showDashboard = async (req, res) => {
  try {
    const users = await User.find();
    const events = await Event.find();
    const totalRSVPs = events.reduce((sum, e) => sum + e.attendees.length, 0);

    // User role distribution
    const usersByRole = { student: 0, organizer: 0, admin: 0 };
    users.forEach(u => { usersByRole[u.role] = (usersByRole[u.role] || 0) + 1; });

    // Events by category
    const categoryList = ['General', 'Sports', 'Festivals', 'Hackathons', 'Discussions', 'Networking', 'Others'];
    const eventsByCategory = {};
    categoryList.forEach(c => { eventsByCategory[c] = 0; });
    events.forEach(e => {
      (e.category || []).forEach(c => {
        if (eventsByCategory[c] !== undefined) eventsByCategory[c]++;
      });
    });

    // Top 5 events by attendance
    const topEvents = [...events]
      .sort((a, b) => b.attendees.length - a.attendees.length)
      .slice(0, 5)
      .map(e => ({ title: e.title, count: e.attendees.length }));

    // Event status: upcoming vs past
    const now = new Date();
    let upcomingCount = 0, pastCount = 0;
    events.forEach(e => {
      if (e.date >= now) upcomingCount++;
      else pastCount++;
    });

    // Events created per month (last 6 months)
    const monthLabels = [];
    const monthCounts = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      monthLabels.push(d.toLocaleString('default', { month: 'short', year: '2-digit' }));
      const count = events.filter(e => {
        const created = new Date(e.createdAt);
        return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth();
      }).length;
      monthCounts.push(count);
    }

    res.render("admin/dashboard", {
      users,
      events,
      totalRSVPs,
      userName: req.session.userName,
      currentUserId: req.session.userId.toString(),
      usersByRole,
      eventsByCategory,
      topEvents,
      upcomingCount,
      pastCount,
      monthLabels,
      monthCounts,
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
  const { name, email, role, studentId, faculty } = req.body;
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
    try {
      const user = await User.findById(req.params.id);
      return res.render("admin/edit-user", { user, errors });
    } catch (err) {
      return res.send("Error reloading form.");
    }
  }
  const existing = await User.findOne({ email, _id: { $ne: req.params.id } });
  if (existing) {
    const user = await User.findById(req.params.id);
    return res.render("admin/edit-user", { user, errors: ["That email is already in use."] });
  }


  try {
    await User.findByIdAndUpdate(req.params.id, {
      name,
      email,
      role,
      studentId,
      faculty
    });

    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.send("Error updating user.");
  }
};

exports.showCreateUser = (req, res) => {
  res.render("admin/create-user", { errors: [] });
};

exports.handleCreateUser = async (req, res) => {
  const { name, email, password, role, studentId, faculty } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push("Name is required.");
  }
  if (!email || !email.includes("@")) {
    errors.push("Valid email is required.");
  }

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters.");
  }

  if (!role) {
    errors.push("Role is required.");
  }

  if (errors.length > 0) {
    return res.render("admin/create-user", { errors });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.render("admin/create-user", {
        errors: ["Email is already in use."],
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ name, email, passwordHash, role, studentId: studentId || "", faculty: faculty || "", bio: "" });
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.send("Error creating user.");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.session.userId.toString()) {
      return res.redirect("/admin/dashboard");
    }

    await deleteUserCascade(req.params.id);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.send("Error deleting user.");
  }
};
