const notificationController = require("../../controller/notification-controller");
const Notification = require("../../models/notification-models");

jest.mock("../../models/notification-models");

describe("Notification Controller", () => {
  let req, res;
  const userId = "64f29c83c8f1f7a2d8e394f0";

  beforeEach(() => {
    req = {
      params: {},
      session: { userId },
    };
    res = {
      render: jest.fn(),
      send: jest.fn(),
      redirect: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getNotificationsPage", () => {
    test("renders notifications page with all user notifications", async () => {
      const mockNotifications = [
        { _id: "n1", message: "Someone RSVPed to your event", isRead: false },
        { _id: "n2", message: "A review was posted on your event", isRead: true },
      ];
      Notification.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockNotifications),
      });
      Notification.updateMany.mockResolvedValue({});

      await notificationController.getNotificationsPage(req, res);

      expect(Notification.find).toHaveBeenCalledWith({ recipient: userId });
      expect(res.render).toHaveBeenCalledWith("user/notifications", {
        notifications: mockNotifications,
      });
    });

    test("marks all unread notifications as read after viewing", async () => {
      Notification.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });
      Notification.updateMany.mockResolvedValue({});

      await notificationController.getNotificationsPage(req, res);

      expect(Notification.updateMany).toHaveBeenCalledWith(
        { recipient: userId, isRead: false },
        { isRead: true },
      );
    });

    test("renders page correctly when there are no notifications", async () => {
      Notification.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });
      Notification.updateMany.mockResolvedValue({});

      await notificationController.getNotificationsPage(req, res);

      expect(res.render).toHaveBeenCalledWith("user/notifications", {
        notifications: [],
      });
    });

    test("sends error message on database failure", async () => {
      Notification.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error("DB error")),
      });

      await notificationController.getNotificationsPage(req, res);

      expect(res.send).toHaveBeenCalledWith("Error loading notifications.");
    });
  });

  describe("markAsRead", () => {
    test("marks specific notification as read and redirects to /notifications", async () => {
      req.params.id = "n1";
      Notification.findOneAndUpdate.mockResolvedValue({});

      await notificationController.markAsRead(req, res);

      expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "n1", recipient: userId },
        { isRead: true },
      );
      expect(res.redirect).toHaveBeenCalledWith("/notifications");
    });

    test("only marks the notification owned by the current user (recipient guard)", async () => {
      req.params.id = "n1";
      Notification.findOneAndUpdate.mockResolvedValue(null); // no match — not owned by user

      await notificationController.markAsRead(req, res);

      // Still redirects regardless of whether the doc was found
      expect(res.redirect).toHaveBeenCalledWith("/notifications");
    });

    test("sends error message on database failure", async () => {
      req.params.id = "n1";
      Notification.findOneAndUpdate.mockRejectedValue(new Error("DB error"));

      await notificationController.markAsRead(req, res);

      expect(res.send).toHaveBeenCalledWith("Error marking notification as read.");
    });
  });
});
