const userController = require("../../controller/user-controller");
const User = require("../../models/user-models");

jest.mock("../../models/user-models");
jest.mock("../../services/userServices", () => ({
  deleteUserCascade: jest.fn().mockResolvedValue(),
}));

const { deleteUserCascade } = require("../../services/userServices");

describe("User Controller", () => {
  let req, res;
  const validObjectId = "64f29c83c8f1f7a2d8e394f0";

  beforeEach(() => {
    req = { body: {}, session: { userId: validObjectId } };
    res = { render: jest.fn(), send: jest.fn(), redirect: jest.fn() };
    jest.clearAllMocks();
  });

  // get profile
  describe("getProfile", () => {
    test("sends error message when user is not found", async () => {
      User.findById.mockResolvedValue(null);
      await userController.getProfile(req, res);
      expect(res.send).toHaveBeenCalledWith("User not found");
    });

    test("renders profile with user data when user exists", async () => {
      const mockUser = {
        _id: "user123",
        name: "Alice",
        email: "alice@test.com",
      };
      User.findById.mockResolvedValue(mockUser);
      await userController.getProfile(req, res);
      expect(res.render).toHaveBeenCalledWith("user/profile", {
        user: mockUser,
      });
    });

    test("sends error message when database throws", async () => {
      User.findById.mockRejectedValue(new Error("DB error"));
      await userController.getProfile(req, res);
      expect(res.send).toHaveBeenCalledWith("Error loading profile");
    });
  });

  // getEditProfile
  describe("getEditProfile", () => {
    test("sends error when user is not found", async () => {
      User.findById.mockResolvedValue(null);
      await userController.getEditProfile(req, res);
      expect(res.send).toHaveBeenCalledWith("User not found");
    });

    test("renders edit-profile form when user exists", async () => {
      const mockUser = { _id: "user123", name: "Alice" };
      User.findById.mockResolvedValue(mockUser);
      await userController.getEditProfile(req, res);
      expect(res.render).toHaveBeenCalledWith("user/edit-profile", {
        user: mockUser,
      });
    });

    test("sends error when database throws", async () => {
      User.findById.mockRejectedValue(new Error("DB error"));
      await userController.getEditProfile(req, res);
      expect(res.send).toHaveBeenCalledWith("Error loading edit page");
    });
  });

  // updateProfile
  describe("updateProfile", () => {
    test("renders error when name is missing", async () => {
      req.body = { name: "", email: "alice@test.com" };
      User.findById.mockResolvedValue({ _id: "user123", name: "Alice", role: "student" });

      await userController.updateProfile(req, res);

      expect(res.render).toHaveBeenCalledWith(
        "user/edit-profile",
        expect.objectContaining({
          errors: expect.arrayContaining(["Name and Email are required"]),
        }),
      );
    });

    test("renders error when email is missing", async () => {
      req.body = { name: "Alice", email: "" };
      User.findById.mockResolvedValue({ _id: "user123", name: "Alice", role: "student" });

      await userController.updateProfile(req, res);

      expect(res.render).toHaveBeenCalledWith(
        "user/edit-profile",
        expect.objectContaining({
          errors: expect.arrayContaining(["Name and Email are required"]),
        }),
      );
    });

    test("renders error when bio exceeds 200 characters", async () => {
      req.body = {
        name: "Alice",
        email: "alice@test.com",
        bio: "a".repeat(201),
      };
      User.findById.mockResolvedValue({ _id: "user123", role: "student" });

      await userController.updateProfile(req, res);

      expect(res.render).toHaveBeenCalledWith(
        "user/edit-profile",
        expect.objectContaining({
          errors: expect.arrayContaining(["Bio cannot exceed 200 characters"]),
        }),
      );
    });

    test("bio of exactly 200 characters does not trigger an error", async () => {
      req.body = {
        name: "Alice",
        email: "alice@test.com",
        bio: "a".repeat(200),
      };
      User.findById.mockResolvedValue({ _id: "user123", role: "student" });
      User.findOne.mockResolvedValue(null);
      User.findByIdAndUpdate.mockResolvedValue({});

      await userController.updateProfile(req, res);

      expect(res.redirect).toHaveBeenCalledWith("/profile");
    });

    test("renders error when email is already used by another account", async () => {
      req.body = { name: "Alice", email: "taken@test.com" };
      User.findById.mockResolvedValue({ _id: "user123", role: "student" });
      User.findOne.mockResolvedValue({ _id: "other123", email: "taken@test.com" });

      await userController.updateProfile(req, res);

      expect(res.render).toHaveBeenCalledWith(
        "user/edit-profile",
        expect.objectContaining({
          errors: expect.arrayContaining([
            "That email is already in use by another account.",
          ]),
        }),
      );
    });

    test("updates profile and redirects to /profile on success", async () => {
      req.body = { name: "Alice", email: "alice@test.com", bio: "Hello!" };
      User.findById.mockResolvedValue({ _id: "user123", role: "student" });
      User.findOne.mockResolvedValue(null);
      User.findByIdAndUpdate.mockResolvedValue({});

      await userController.updateProfile(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/profile");
    });
  });

  // delete profile
  describe("deleteProfile", () => {
    test("sends Unauthorized when no userId in session", async () => {
      req.session.userId = undefined;
      await userController.deleteProfile(req, res);
      expect(res.send).toHaveBeenCalledWith("Unauthorized");
    });

    test("sends error when session.destroy callback receives an error", async () => {
      req.session.userId = validObjectId;
      req.session.destroy = jest.fn((cb) => cb(new Error("session error")));

      await userController.deleteProfile(req, res);

      expect(res.send).toHaveBeenCalledWith("Error logging out");
    });

    test("destroys session and redirects to /auth/login on success", async () => {
      req.session.userId = validObjectId;
      req.session.destroy = jest.fn((cb) => cb(null));

      await userController.deleteProfile(req, res);

      expect(deleteUserCascade).toHaveBeenCalledWith(validObjectId);
      expect(res.redirect).toHaveBeenCalledWith("/auth/login");
    });
  });
});
