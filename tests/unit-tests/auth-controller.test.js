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

  // registration tests
  describe("registerPost", () => {
    test("errors when name is missing", async () => {
      req.body = { email: "test@test.com", password: "pass123" };
      await authController.registerPost(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "auth/register",
        expect.objectContaining({
          errors: expect.arrayContaining(["Name is required."]),
        }),
      );
    });

    test("errors when name is only whitespace", async () => {
      req.body = { name: "   ", email: "test@test.com", password: "pass123" };
      await authController.registerPost(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "auth/register",
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
        "auth/register",
        expect.objectContaining({
          errors: expect.arrayContaining(["Please enter a valid email"]),
        }),
      );
    });

    test("errors when email is empty", async () => {
      req.body = { name: "John", email: "", password: "pass123" };
      await authController.registerPost(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "auth/register",
        expect.objectContaining({
          errors: expect.arrayContaining(["Please enter a valid email"]),
        }),
      );
    });

    test("errors when password is exactly 5 characters (below minimum)", async () => {
      req.body = { name: "John", email: "john@test.com", password: "12345" };
      await authController.registerPost(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "auth/register",
        expect.objectContaining({
          errors: expect.arrayContaining([
            "Passwords requires minimum of 6 characters",
          ]),
        }),
      );
    });

    test("errors when password is only whitespace below minimum length", async () => {
      req.body = { name: "John", email: "john@test.com", password: "     " };
      await authController.registerPost(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "auth/register",
        expect.objectContaining({
          errors: expect.arrayContaining([
            "Passwords requires minimum of 6 characters",
          ]),
        }),
      );
    });

    test("redirects to /auth/login on successful registration", async () => {
      req.body = { name: "John", email: "john@test.com", password: "pass123" };
      bcrypt.hash.mockResolvedValue("hashedpass");
      User.create.mockResolvedValue({});

      await authController.registerPost(req, res);

      expect(res.redirect).toHaveBeenCalledWith("/auth/login");
    });

    test("renders error when email is already registered (duplicate key error)", async () => {
      req.body = { name: "John", email: "john@test.com", password: "pass123" };
      bcrypt.hash.mockResolvedValue("hashedpass");
      User.create.mockRejectedValue({ code: 11000 });

      await authController.registerPost(req, res);

      expect(res.render).toHaveBeenCalledWith(
        "auth/register",
        expect.objectContaining({
          errors: expect.arrayContaining([
            "An account with that email already exists.",
          ]),
        }),
      );
    });

    test("renders generic error on unexpected database failure", async () => {
      req.body = { name: "John", email: "john@test.com", password: "pass123" };
      bcrypt.hash.mockResolvedValue("hashedpass");
      User.create.mockRejectedValue(new Error("DB failure"));

      await authController.registerPost(req, res);

      expect(res.render).toHaveBeenCalledWith(
        "auth/register",
        expect.objectContaining({
          errors: expect.arrayContaining(["Registration failed. Please try again."]),
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
        "auth/login",
        expect.objectContaining({
          errors: expect.arrayContaining(["Please enter an email"]),
        }),
      );
    });

    test("errors when password is missing", async () => {
      req.body = { email: "john@test.com" };
      await authController.loginPost(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "auth/login",
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
        "auth/login",
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
        "auth/login",
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

    test("sets session userId, userName and role on successful login", async () => {
      req.body = { email: "stu@test.com", password: "pass123" };
      const mockUser = {
        _id: "stuId",
        name: "Stu",
        role: "student",
        passwordHash: "hash",
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      await authController.loginPost(req, res);

      expect(req.session.userId).toBe(mockUser._id);
      expect(req.session.userName).toBe(mockUser.name);
      expect(req.session.role).toBe(mockUser.role);
    });

    test("renders generic error on database failure during login", async () => {
      req.body = { email: "stu@test.com", password: "pass123" };
      User.findOne.mockRejectedValue(new Error("DB failure"));

      await authController.loginPost(req, res);

      expect(res.render).toHaveBeenCalledWith(
        "auth/login",
        expect.objectContaining({
          errors: expect.arrayContaining(["Login failed. Please try again."]),
        }),
      );
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
