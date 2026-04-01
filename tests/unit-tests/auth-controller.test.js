const authController = require("../../controller/auth-controller");
const User = require("../../models/user-models");
const bcrypt = require("bcrypt");

jest.mock("../../models/user-models");
jest.mock("bcrypt");

describe("Auth Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, session: {} };
    res = { render: jest.fn(), send: jest.fn(), redirect: jest.fn() };
    jest.clearAllMocks();
  });

  // registartion tests
  describe("registerPost", () => {
    test("errors when name is missing", async () => {
      req.body = { email: "test@test.com", password: "pass123" };
      await authController.registerPost(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "register",
        expect.objectContaining({
          errors: expect.arrayContaining(["Name is required."]),
        }),
      );
    });

    test("errors when name is only whitespace", async () => {
      req.body = { name: "   ", email: "test@test.com", password: "pass123" };
      await authController.registerPost(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "register",
        expect.objectContaining({
          errors: expect.arrayContaining(["Name is required."]),
        }),
      );
    });

    test("errors when email has no @ symbol", async () => {
      req.body = {
        name: "John",
        email: "invalidemail.com",
        password: "pass123",
      };
      await authController.registerPost(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "register",
        expect.objectContaining({
          errors: expect.arrayContaining(["Please enter a valid email"]),
        }),
      );
    });

    test("errors when email is empty", async () => {
      req.body = { name: "John", email: "", password: "pass123" };
      await authController.registerPost(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "register",
        expect.objectContaining({
          errors: expect.arrayContaining(["Please enter a valid email"]),
        }),
      );
    });

    test("errors when password is exactly 5 characters (below minimum)", async () => {
      req.body = { name: "John", email: "john@test.com", password: "12345" };
      await authController.registerPost(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "register",
        expect.objectContaining({
          errors: expect.arrayContaining([
            "Passwords requires minimum of 6 characters",
          ]),
        }),
      );
    });
  });

  // login tests

  describe("loginPost", () => {
    test("errors when email is missing", async () => {
      req.body = { password: "pass123" };
      await authController.loginPost(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "login",
        expect.objectContaining({
          errors: expect.arrayContaining(["Please enter an email"]),
        }),
      );
    });

    test("errors when password is missing", async () => {
      req.body = { email: "john@test.com" };
      await authController.loginPost(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "login",
        expect.objectContaining({
          errors: expect.arrayContaining(["Passwords is required"]),
        }),
      );
    });

    test("errors when no user matches the email", async () => {
      req.body = { email: "ghost@test.com", password: "pass123" };
      User.findOne.mockResolvedValue(null);
      await authController.loginPost(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "login",
        expect.objectContaining({
          errors: expect.arrayContaining(["Invalid email or password."]),
        }),
      );
    });

    test("errors when password does not match stored hash", async () => {
      req.body = { email: "john@test.com", password: "wrongpass" };
      User.findOne.mockResolvedValue({
        _id: "id1",
        name: "John",
        role: "student",
        passwordHash: "hash",
      });
      bcrypt.compare.mockResolvedValue(false);
      await authController.loginPost(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "login",
        expect.objectContaining({
          errors: expect.arrayContaining(["Invalid email or password."]),
        }),
      );
    });

    test("redirects admin user to /admin/dashboard", async () => {
      req.body = { email: "admin@test.com", password: "pass123" };
      User.findOne.mockResolvedValue({
        _id: "adminId",
        name: "Admin",
        role: "admin",
        passwordHash: "hash",
      });
      bcrypt.compare.mockResolvedValue(true);
      await authController.loginPost(req, res);
      expect(res.redirect).toHaveBeenCalledWith("/admin/dashboard");
    });

    test("redirects non-admin user to /events", async () => {
      req.body = { email: "stu@test.com", password: "pass123" };
      User.findOne.mockResolvedValue({
        _id: "stuId",
        name: "Stu",
        role: "student",
        passwordHash: "hash",
      });
      bcrypt.compare.mockResolvedValue(true);
      await authController.loginPost(req, res);
      expect(res.redirect).toHaveBeenCalledWith("/events");
    });
  });

  // logout
  describe("logout", () => {
    test("destroys the session and redirects to /auth/login", () => {
      req.session.destroy = jest.fn((cb) => cb());
      authController.logout(req, res);
      expect(req.session.destroy).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/auth/login");
    });
  });
});
