const reviewController = require("../../controller/review-controller");
const Review = require("../../models/review-models");
const Event = require("../../models/event-models");
const Notification = require("../../models/notification-models");

jest.mock("../../models/review-models");
jest.mock("../../models/event-models");
jest.mock("../../models/notification-models");

describe("Review Controller", () => {
  let req, res;
  const userId = "64f29c83c8f1f7a2d8e394f0";

  beforeEach(() => {
    req = {
      params: { id: "evt1", reviewId: "rev1" },
      body: {},
      session: { userId, role: "student" },
    };
    res = {
      render: jest.fn(),
      send: jest.fn(),
      redirect: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("addReviewPage", () => {
    test("renders create-review page when event is found", async () => {
      const mockEvent = { _id: "evt1", title: "Hackathon" };
      Event.findById.mockResolvedValue(mockEvent);

      await reviewController.addReviewPage(req, res);

      expect(res.render).toHaveBeenCalledWith("review/create-review", {
        event: mockEvent,
      });
    });

    test("sends error when event is not found", async () => {
      Event.findById.mockResolvedValue(null);

      await reviewController.addReviewPage(req, res);

      expect(res.send).toHaveBeenCalledWith("Event not found.");
    });
  });

  describe("addReview", () => {
    test("redirects back to event when title is missing", async () => {
      req.body = { title: "", rating: "4", comment: "Great!" };

      await reviewController.addReview(req, res);

      expect(Review.create).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/events/evt1");
    });

    test("redirects back to event when rating is missing", async () => {
      req.body = { title: "Great", rating: "", comment: "Loved it!" };

      await reviewController.addReview(req, res);

      expect(Review.create).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/events/evt1");
    });

    test("redirects back to event when comment is missing", async () => {
      req.body = { title: "Great", rating: "5", comment: "" };

      await reviewController.addReview(req, res);

      expect(Review.create).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/events/evt1");
    });

    test("creates review, pushes to event, and notifies organizer on success", async () => {
      req.body = { title: "Great Event", rating: "5", comment: "Loved it!" };
      const mockReview = { _id: "rev1" };
      const mockEvent = {
        title: "Hackathon",
        organiser: { toString: () => "organizer123" },
      };
      Review.create.mockResolvedValue(mockReview);
      Event.findByIdAndUpdate.mockResolvedValue({});
      Event.findById.mockResolvedValue(mockEvent);
      Notification.create.mockResolvedValue({});

      await reviewController.addReview(req, res);

      expect(Review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "evt1",
          user: userId,
          title: "Great Event",
          rating: "5",
          comment: "Loved it!",
        }),
      );
      expect(Event.findByIdAndUpdate).toHaveBeenCalledWith("evt1", {
        $push: { reviews: "rev1" },
      });
      expect(Notification.create).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/events/evt1");
    });

    test("does not notify organizer when reviewer is the organizer", async () => {
      req.body = { title: "My Own Event", rating: "5", comment: "Loved it!" };
      Review.create.mockResolvedValue({ _id: "rev1" });
      Event.findByIdAndUpdate.mockResolvedValue({});
      Event.findById.mockResolvedValue({
        title: "Event",
        organiser: { toString: () => userId }, // reviewer IS the organizer
      });

      await reviewController.addReview(req, res);

      expect(Notification.create).not.toHaveBeenCalled();
    });
  });

  describe("editReviewPageUser", () => {
    test("sends error when review is not found", async () => {
      Review.findById.mockResolvedValue(null);

      await reviewController.editReviewPageUser(req, res);

      expect(res.send).toHaveBeenCalledWith("Review not found.");
    });

    test("sends unauthorized when user does not own the review", async () => {
      Review.findById.mockResolvedValue({
        _id: "rev1",
        user: { toString: () => "anotherUserId" },
      });

      await reviewController.editReviewPageUser(req, res);

      expect(res.send).toHaveBeenCalledWith(
        "Unauthorized: You can only edit your own reviews.",
      );
    });

    test("renders edit-review page when user owns the review", async () => {
      const mockReview = { _id: "rev1", user: { toString: () => userId } };
      Review.findById.mockResolvedValue(mockReview);

      await reviewController.editReviewPageUser(req, res);

      expect(res.render).toHaveBeenCalledWith("review/edit-review", {
        review: mockReview,
        eventId: "evt1",
      });
    });
  });

  describe("editReview", () => {
    test("sends error when review is not found", async () => {
      Review.findById.mockResolvedValue(null);

      await reviewController.editReview(req, res);

      expect(res.send).toHaveBeenCalledWith("Review not found.");
    });

    test("sends unauthorized when user does not own the review", async () => {
      Review.findById.mockResolvedValue({
        _id: "rev1",
        user: { toString: () => "anotherUserId" },
        save: jest.fn(),
      });
      req.body = { title: "Updated", rating: "3", comment: "Ok" };

      await reviewController.editReview(req, res);

      expect(res.send).toHaveBeenCalledWith(
        "You are not allowed to edit this review.",
      );
    });

    test("saves updated fields and redirects to event page on success", async () => {
      const mockSave = jest.fn().mockResolvedValue({});
      const mockReview = {
        _id: "rev1",
        user: { toString: () => userId },
        title: "Old Title",
        rating: "2",
        comment: "Meh",
        save: mockSave,
      };
      Review.findById.mockResolvedValue(mockReview);
      req.body = { title: "Updated Title", rating: "5", comment: "Excellent!" };

      await reviewController.editReview(req, res);

      expect(mockReview.title).toBe("Updated Title");
      expect(mockReview.rating).toBe("5");
      expect(mockReview.comment).toBe("Excellent!");
      expect(mockSave).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/events/evt1");
    });
  });

  describe("deleteReview (admin or owner)", () => {
    test("sends error when review is not found", async () => {
      Review.findById.mockResolvedValue(null);

      await reviewController.deleteReview(req, res);

      expect(res.send).toHaveBeenCalledWith("Review not found.");
    });

    test("sends unauthorized when non-owner non-admin tries to delete", async () => {
      req.session.role = "student";
      Review.findById.mockResolvedValue({
        _id: "rev1",
        user: { toString: () => "anotherUserId" },
      });

      await reviewController.deleteReview(req, res);

      expect(Review.findByIdAndDelete).not.toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(
        "Unauthorized: You cannot delete this review.",
      );
    });

    test("allows review owner to delete their own review", async () => {
      req.session.role = "student";
      Review.findById.mockResolvedValue({
        _id: "rev1",
        user: { toString: () => userId },
      });
      Review.findByIdAndDelete.mockResolvedValue({});
      Event.findByIdAndUpdate.mockResolvedValue({});

      await reviewController.deleteReview(req, res);

      expect(Review.findByIdAndDelete).toHaveBeenCalledWith("rev1");
      expect(Event.findByIdAndUpdate).toHaveBeenCalledWith("evt1", {
        $pull: { reviews: "rev1" },
      });
      expect(res.redirect).toHaveBeenCalledWith("/events/evt1");
    });

    test("allows admin to delete any review regardless of ownership", async () => {
      req.session.role = "admin";
      Review.findById.mockResolvedValue({
        _id: "rev1",
        user: { toString: () => "anotherUserId" }, // admin does not own it
      });
      Review.findByIdAndDelete.mockResolvedValue({});
      Event.findByIdAndUpdate.mockResolvedValue({});

      await reviewController.deleteReview(req, res);

      expect(Review.findByIdAndDelete).toHaveBeenCalledWith("rev1");
      expect(res.redirect).toHaveBeenCalledWith("/events/evt1");
    });
  });

  describe("deleteOwnReview (user only)", () => {
    test("sends error when review is not found", async () => {
      Review.findById.mockResolvedValue(null);

      await reviewController.deleteOwnReview(req, res);

      expect(res.send).toHaveBeenCalledWith("Review not found.");
    });

    test("sends unauthorized when user does not own the review", async () => {
      Review.findById.mockResolvedValue({
        _id: "rev1",
        user: { toString: () => "anotherUserId" },
      });

      await reviewController.deleteOwnReview(req, res);

      expect(Review.findByIdAndDelete).not.toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(
        "Unauthorized: You can only delete your own reviews.",
      );
    });

    test("deletes review and redirects to event page on success", async () => {
      Review.findById.mockResolvedValue({
        _id: "rev1",
        user: { toString: () => userId },
      });
      Review.findByIdAndDelete.mockResolvedValue({});
      Event.findByIdAndUpdate.mockResolvedValue({});

      await reviewController.deleteOwnReview(req, res);

      expect(Review.findByIdAndDelete).toHaveBeenCalledWith("rev1");
      expect(Event.findByIdAndUpdate).toHaveBeenCalledWith("evt1", {
        $pull: { reviews: "rev1" },
      });
      expect(res.redirect).toHaveBeenCalledWith("/events/evt1");
    });
  });
});
