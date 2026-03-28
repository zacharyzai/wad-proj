const adminController = require("../../controller/admin-controller");
const User = require("../../models/user-models");
const Event = require("../../models/event-models");
const bcrypt = require("bcrypt");

jest.mock("../../models/user-models");
jest.mock("../../models/event-models");
jest.mock("bcrypt");

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
});
