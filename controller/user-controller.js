const User = require("../models/user-models");

//View Profile
exports.getProfile = async (req, res) => {
  try {
    // Get logged in user from database using session userId
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.send("User not found");
    }

    res.render("profile", { user });
  } catch (err) {
    res.send("Error loading profile");
  }
};

// Show edit form
exports.getEditProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.send("User not found");
    }

    res.render("edit-profile", { user });
  } catch (err) {
    res.send("Error loading edit page");
  }
};

//Update profile (CRUD)
exports.updateProfile = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const studentId = req.body.studentId;
    const faculty = req.body.faculty;
    const bio = req.body.bio;

    if (!name || !email) {
      const user = await User.findById(req.session.userId);
      return res.render("edit-profile", {
        user,
        errors: ["Name and Email are required"],
      });
    }

    if (bio && bio.length > 200) {
      return res.send("Bio cannot exceed 200 characters");
    }

    await User.findByIdAndUpdate(req.session.userId, {
      name,
      email,
      studentId,
      faculty,
      bio,
    });

    // Redirect back to profile page after update
    res.redirect("/profile");
  } catch (err) {
    res.send("Error updating profile");
  }
};

//Delete profile (CRUD)
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.send("Unauthorized");
    }

    await User.findByIdAndDelete(userId);

    // Destroy session after deletion
    req.session.destroy((err) => {
      if (err) {
        return res.send("Error logging out");
      }
      res.redirect("/auth/login");
    });
    
  } catch (err) {
    res.send("Error deleting profile");
  }
};