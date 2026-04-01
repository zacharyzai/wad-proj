const userController = require("../../controller/user-controller");
const User = require("../../models/user-models");

jest.mock("../../models/user-models");

describe("User Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, session: { userId: "user123" } };
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
      expect(res.render).toHaveBeenCalledWith("user/profile", { user: mockUser });
    });
  });

  // updateProfile
  describe("updateProfile", () => {
    test("renders error when name is missing", async () => {
      req.body = { name: "", email: "alice@test.com" };
      const mockUser = { _id: "user123", name: "Alice" };
      User.findById.mockResolvedValue(mockUser);

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
      const mockUser = { _id: "user123", name: "Alice" };
      User.findById.mockResolvedValue(mockUser);

      await userController.updateProfile(req, res);

      expect(res.render).toHaveBeenCalledWith(
        "user/edit-profile",
        expect.objectContaining({
          errors: expect.arrayContaining(["Name and Email are required"]),
        }),
      );
    });
  });

  // delete profile
  describe("deleteProfile", () => {
    test("sends error when session.destroy callback receives an error", async () => {
      req.session.userId = "user123";
      req.session.destroy = jest.fn((cb) => cb(new Error("session error")));
      User.findByIdAndDelete.mockResolvedValue({});

      await userController.deleteProfile(req, res);

      expect(res.send).toHaveBeenCalledWith("Error logging out");
    });
  });
});
