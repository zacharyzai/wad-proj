const adminController = require("../../controller/admin-controller");
const User = require("../../models/user-models");
const Event = require("../../models/event-models");
const bcrypt = require("bcrypt");

jest.mock("../../models/user-models");
jest.mock("../../models/event-models");
jest.mock("bcrypt");
jest.mock("../../services/userServices", () => ({
  deleteUserCascade: jest.fn().mockResolvedValue(),
}));

const { deleteUserCascade } = require("../../services/userServices");

describe("Admin Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      session: { userId: "adminId", userName: "Admin" },
    };
    res = { render: jest.fn(), send: jest.fn(), redirect: jest.fn() };
    jest.clearAllMocks();
  });

  describe("showDashboard", () => {
    test("renders dashboard with aggregated user and event stats", async () => {
      const mockUsers = [
        { _id: "u1", role: "student" },
        { _id: "u2", role: "organizer" },
      ];
      const mockEvents = [
        {
          _id: "e1",
          title: "Fest",
          attendees: ["u1"],
          category: ["General"],
          date: new Date("2020-01-01"),
          createdAt: new Date("2025-01-01"),
        },
        {
          _id: "e2",
          title: "Hack",
          attendees: [],
          category: ["Sports"],
          date: new Date("2030-01-01"),
          createdAt: new Date("2025-02-01"),
        },
      ];
      User.find.mockResolvedValue(mockUsers);
      Event.find.mockResolvedValue(mockEvents);

      await adminController.showDashboard(req, res);

      expect(res.render).toHaveBeenCalledWith(
        "admin/dashboard",
        expect.objectContaining({
          users: mockUsers,
          events: mockEvents,
          totalRSVPs: 1,
        }),
      );
    });

    test("sends error message on database failure", async () => {
      User.find.mockRejectedValue(new Error("DB failure"));
      await adminController.showDashboard(req, res);
      expect(res.send).toHaveBeenCalledWith("Error loading dashboard.");
    });
  });

  describe("showEditUser", () => {
    test("renders edit-user form when user is found", async () => {
      req.params.id = "userId1";
      const mockUser = { _id: "userId1", name: "Alice" };
      User.findById.mockResolvedValue(mockUser);

      await adminController.showEditUser(req, res);

      expect(res.render).toHaveBeenCalledWith("admin/edit-user", {
        user: mockUser,
        errors: [],
      });
    });

    test("sends error when user is not found", async () => {
      req.params.id = "userId1";
      User.findById.mockResolvedValue(null);

      await adminController.showEditUser(req, res);

      expect(res.send).toHaveBeenCalledWith("User not found.");
    });
  });

  describe("handleCreateUser", () => {
    test("renders error when name is missing", async () => {
      req.body = {
        name: "",
        email: "user@test.com",
        password: "pass123",
        role: "student",
      };
      await adminController.handleCreateUser(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "admin/create-user",
        expect.objectContaining({
          errors: expect.arrayContaining(["Name is required."]),
        }),
      );
    });

    test("renders error when name is only whitespace", async () => {
      req.body = {
        name: "   ",
        email: "user@test.com",
        password: "pass123",
        role: "student",
      };
      await adminController.handleCreateUser(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "admin/create-user",
        expect.objectContaining({
          errors: expect.arrayContaining(["Name is required."]),
        }),
      );
    });

    test("renders error when email is missing @", async () => {
      req.body = {
        name: "Bob",
        email: "notanemail",
        password: "pass123",
        role: "student",
      };
      await adminController.handleCreateUser(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "admin/create-user",
        expect.objectContaining({
          errors: expect.arrayContaining(["Valid email is required."]),
        }),
      );
    });

    test("renders error when password is shorter than 6 characters", async () => {
      req.body = {
        name: "Bob",
        email: "bob@test.com",
        password: "abc",
        role: "student",
      };
      await adminController.handleCreateUser(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "admin/create-user",
        expect.objectContaining({
          errors: expect.arrayContaining([
            "Password must be at least 6 characters.",
          ]),
        }),
      );
    });

    test("renders error when role is missing", async () => {
      req.body = {
        name: "Bob",
        email: "bob@test.com",
        password: "pass123",
        role: "",
      };
      await adminController.handleCreateUser(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "admin/create-user",
        expect.objectContaining({
          errors: expect.arrayContaining(["Role is required."]),
        }),
      );
    });

    test("renders error when email is already in use", async () => {
      req.body = {
        name: "Bob",
        email: "existing@test.com",
        password: "pass123",
        role: "student",
      };
      User.findOne.mockResolvedValue({ email: "existing@test.com" });

      await adminController.handleCreateUser(req, res);

      expect(User.create).not.toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(
        "admin/create-user",
        expect.objectContaining({
          errors: expect.arrayContaining(["Email is already in use."]),
        }),
      );
    });

    test("creates user and redirects to /admin/dashboard on success", async () => {
      req.body = {
        name: "Bob",
        email: "bob@test.com",
        password: "pass123",
        role: "student",
      };
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedpass");
      User.create.mockResolvedValue({});

      await adminController.handleCreateUser(req, res);

      expect(User.create).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  describe("handleEditUser", () => {
    test("renders errors when name is empty", async () => {
      req.params.id = "userId1";
      req.body = { name: "", email: "user@test.com", role: "student" };
      User.findById.mockResolvedValue({ _id: "userId1", name: "Old Name" });

      await adminController.handleEditUser(req, res);

      expect(res.render).toHaveBeenCalledWith(
        "admin/edit-user",
        expect.objectContaining({
          errors: expect.arrayContaining(["Name is required."]),
        }),
      );
    });

    test("renders errors when email has no @ symbol", async () => {
      req.params.id = "userId1";
      req.body = { name: "Alice", email: "someinvalidemail", role: "student" };
      User.findById.mockResolvedValue({ _id: "userId1", name: "Alice" });

      await adminController.handleEditUser(req, res);

      expect(res.render).toHaveBeenCalledWith(
        "admin/edit-user",
        expect.objectContaining({
          errors: expect.arrayContaining(["Valid email is required."]),
        }),
      );
    });

    test("renders error when role is missing", async () => {
      req.params.id = "userId1";
      req.body = { name: "Alice", email: "alice@test.com", role: "" };
      User.findById.mockResolvedValue({ _id: "userId1", name: "Alice" });

      await adminController.handleEditUser(req, res);

      expect(res.render).toHaveBeenCalledWith(
        "admin/edit-user",
        expect.objectContaining({
          errors: expect.arrayContaining(["Role is required."]),
        }),
      );
    });

    test("updates user and redirects on valid input", async () => {
      req.params.id = "userId1";
      req.body = {
        name: "Alice Updated",
        email: "alice@test.com",
        role: "organizer",
        studentId: "0123456",
        faculty: "SCIS",
      };
      User.findByIdAndUpdate.mockResolvedValue({});

      await adminController.handleEditUser(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith("userId1", {
        name: "Alice Updated",
        email: "alice@test.com",
        role: "organizer",
        studentId: "0123456",
        faculty: "SCIS",
      });
      expect(res.redirect).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  describe("deleteUser", () => {
    test("redirects to /admin/dashboard without deleting when admin tries to delete themselves", async () => {
      req.params.id = "adminId"; // matches session.userId
      await adminController.deleteUser(req, res);
      expect(deleteUserCascade).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/admin/dashboard");
    });

    test("calls deleteUserCascade and redirects to /admin/dashboard on success", async () => {
      req.params.id = "otherUserId";
      await adminController.deleteUser(req, res);
      expect(deleteUserCascade).toHaveBeenCalledWith("otherUserId");
      expect(res.redirect).toHaveBeenCalledWith("/admin/dashboard");
    });

    test("sends error on database failure", async () => {
      req.params.id = "otherUserId";
      deleteUserCascade.mockRejectedValueOnce(new Error("DB failure"));
      await adminController.deleteUser(req, res);
      expect(res.send).toHaveBeenCalledWith("Error deleting user.");
    });
  });
});
