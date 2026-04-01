const User = require("../models/user-models");
const Event = require("../models/event-models");

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
    console.log(err)
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
    console.log(err)
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
    let errors=[];

    const user = await User.findById(req.session.userId);

    if (!name || !email) {
      errors.push("Name and Email are required");
    }

    if (bio && bio.length > 200) {
      errors.push("Bio cannot exceed 200 characters");
    }

    if (errors.length > 0) {
      return res.render("edit-profile", {
        user: {
          name: name,
          email: email,
          studentId: studentId,
          faculty: faculty,
          bio: bio,
          role: user.role
        },
        errors
      });
    }

    const existingUser = await User.findOne({email, _id: { $ne: req.session.userId }});
    if (existingUser) {
      errors.push("That email is already in use by another account.")
      return res.render("edit-profile", {user: {
        name,
        email, 
        studentId, 
        faculty,
        bio,
        role: user.role
      }, errors
    })
    };

    await User.findByIdAndUpdate(req.session.userId, {
      name,
      email,
      studentId,
      faculty,
      bio
    });

    // Redirect back to profile page after update
    res.redirect("/profile");
  } catch (err) {
    console.log(err)
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

    await Event.deleteMany({ organiser: userId });           // delete events they organised
    await Event.updateMany(                                  // remove them from all attendee lists
      { attendees: userId },
      { $pull: { attendees: userId } }
    );
await User.findByIdAndDelete(userId);

    await User.findByIdAndDelete(userId);

    // Destroy session after deletion
    req.session.destroy((err) => {
      if (err) {
        return res.send("Error logging out");
      }
      res.redirect("/auth/login");
    });
    
  } catch (err) {
    console.log(err)
    res.send("Error deleting profile");
  }
};