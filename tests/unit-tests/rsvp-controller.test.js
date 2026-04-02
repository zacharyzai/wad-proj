const rsvpController = require("../../controller/rsvp-controller");
const Event = require("../../models/event-models");
const RSVP = require("../../models/rsvp-models");
const Notification = require("../../models/notification-models");

jest.mock("../../models/event-models");
jest.mock("../../models/rsvp-models");
jest.mock("../../models/notification-models");

describe("RSVP Controller", () => {
  let req, res;
  const userId = "64f29c83c8f1f7a2d8e394f0";

  beforeEach(() => {
    req = {
      params: { id: "evt1" },
      body: {},
      session: { userId },
    };
    res = {
      redirect: jest.fn(),
      send: jest.fn(),
      render: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("rsvpEvent", () => {
    test("redirects with 404 status when event is not found", async () => {
      Event.findById.mockResolvedValue(null);
      RSVP.findOne.mockResolvedValue(null);
      RSVP.create.mockResolvedValue({});

      await rsvpController.rsvpEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.redirect).toHaveBeenCalledWith("/events?sort=upcoming");
    });

    test("redirects without updating attendees when user is already attending", async () => {
      Event.findById.mockResolvedValue({
        _id: "evt1",
        title: "Event",
        attendees: [userId], // user already in list
        date: new Date("2030-01-01"),
        maxAttendees: null,
        organiser: { toString: () => "organizer123" },
      });
      RSVP.findOne.mockResolvedValue(null);
      RSVP.create.mockResolvedValue({});

      await rsvpController.rsvpEvent(req, res);

      expect(Event.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/events?sort=upcoming");
    });

    test("redirects without updating attendees when event date is in the past", async () => {
      Event.findById.mockResolvedValue({
        _id: "evt1",
        title: "Past Event",
        attendees: [],
        date: new Date("2020-01-01"),
        maxAttendees: null,
        organiser: { toString: () => "organizer123" },
      });
      RSVP.findOne.mockResolvedValue(null);
      RSVP.create.mockResolvedValue({});

      await rsvpController.rsvpEvent(req, res);

      expect(Event.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/events?sort=upcoming");
    });

    test("redirects with error=full when event has reached max capacity", async () => {
      Event.findById.mockResolvedValue({
        _id: "evt1",
        title: "Full Event",
        attendees: ["user1", "user2", "user3"],
        date: new Date("2030-01-01"),
        maxAttendees: 3,
        organiser: { toString: () => "organizer123" },
      });
      RSVP.findOne.mockResolvedValue(null);
      RSVP.create.mockResolvedValue({});

      await rsvpController.rsvpEvent(req, res);

      expect(Event.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/events?sort=upcoming&error=full");
    });

    test("updates existing cancelled RSVP back to attending", async () => {
      const mockSave = jest.fn().mockResolvedValue({});
      const mockRsvp = { status: "cancelled", save: mockSave };
      Event.findById.mockResolvedValue({
        _id: "evt1",
        title: "Event",
        attendees: [],
        date: new Date("2030-01-01"),
        maxAttendees: null,
        organiser: { toString: () => userId },
      });
      RSVP.findOne.mockResolvedValue(mockRsvp);
      Event.findByIdAndUpdate.mockResolvedValue({});

      await rsvpController.rsvpEvent(req, res);

      expect(mockRsvp.status).toBe("attending");
      expect(mockSave).toHaveBeenCalled();
    });

    test("creates a new RSVP record when none exists", async () => {
      Event.findById.mockResolvedValue({
        _id: "evt1",
        title: "Event",
        attendees: [],
        date: new Date("2030-01-01"),
        maxAttendees: null,
        organiser: { toString: () => "organizer123" },
      });
      RSVP.findOne.mockResolvedValue(null);
      RSVP.create.mockResolvedValue({});
      Event.findByIdAndUpdate.mockResolvedValue({});
      Notification.create.mockResolvedValue({});

      await rsvpController.rsvpEvent(req, res);

      expect(RSVP.create).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "evt1",
          user: userId,
          status: "attending",
        }),
      );
    });

    test("adds user to event attendees and notifies organizer on success", async () => {
      const organizerId = "organizer123";
      Event.findById.mockResolvedValue({
        _id: "evt1",
        title: "Event",
        attendees: [],
        date: new Date("2030-01-01"),
        maxAttendees: null,
        organiser: { toString: () => organizerId },
      });
      RSVP.findOne.mockResolvedValue(null);
      RSVP.create.mockResolvedValue({});
      Event.findByIdAndUpdate.mockResolvedValue({});
      Notification.create.mockResolvedValue({});

      await rsvpController.rsvpEvent(req, res);

      expect(Event.findByIdAndUpdate).toHaveBeenCalledWith("evt1", {
        $addToSet: { attendees: userId },
      });
      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: expect.anything(),
          message: expect.stringContaining("Event"),
        }),
      );
    });

    test("does not send notification when user RSVPs to their own event", async () => {
      Event.findById.mockResolvedValue({
        _id: "evt1",
        title: "My Event",
        attendees: [],
        date: new Date("2030-01-01"),
        maxAttendees: null,
        organiser: { toString: () => userId }, // same as session userId
      });
      RSVP.findOne.mockResolvedValue(null);
      RSVP.create.mockResolvedValue({});
      Event.findByIdAndUpdate.mockResolvedValue({});

      await rsvpController.rsvpEvent(req, res);

      expect(Notification.create).not.toHaveBeenCalled();
    });

    test("does not block RSVP when maxAttendees is not set (unlimited)", async () => {
      Event.findById.mockResolvedValue({
        _id: "evt1",
        title: "Unlimited Event",
        attendees: ["u1", "u2", "u3"],
        date: new Date("2030-01-01"),
        maxAttendees: null, // no cap
        organiser: { toString: () => "organizer123" },
      });
      RSVP.findOne.mockResolvedValue(null);
      RSVP.create.mockResolvedValue({});
      Event.findByIdAndUpdate.mockResolvedValue({});
      Notification.create.mockResolvedValue({});

      await rsvpController.rsvpEvent(req, res);

      expect(Event.findByIdAndUpdate).toHaveBeenCalled();
    });

    test("returns 500 status on unexpected database error", async () => {
      Event.findById.mockRejectedValue(new Error("DB error"));

      await rsvpController.rsvpEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("unrsvpEvent", () => {
    test("removes user from attendees, marks RSVP cancelled, and redirects to /rsvp/my-rsvps", async () => {
      const mockSave = jest.fn().mockResolvedValue({});
      const mockRsvp = { status: "attending", save: mockSave };
      Event.findByIdAndUpdate.mockResolvedValue({});
      RSVP.findOne.mockResolvedValue(mockRsvp);

      await rsvpController.unrsvpEvent(req, res);

      expect(Event.findByIdAndUpdate).toHaveBeenCalledWith("evt1", {
        $pull: { attendees: userId },
      });
      expect(mockRsvp.status).toBe("cancelled");
      expect(mockSave).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/rsvp/my-rsvps");
    });

    test("still redirects to /rsvp/my-rsvps when no RSVP record exists", async () => {
      Event.findByIdAndUpdate.mockResolvedValue({});
      RSVP.findOne.mockResolvedValue(null);

      await rsvpController.unrsvpEvent(req, res);

      expect(res.redirect).toHaveBeenCalledWith("/rsvp/my-rsvps");
    });

    test("returns 500 status on unexpected database error", async () => {
      Event.findByIdAndUpdate.mockRejectedValue(new Error("DB error"));

      await rsvpController.unrsvpEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("myRsvpsPage", () => {
    test("renders my-rsvps page with attending RSVPs sorted by date", async () => {
      const mockRsvps = [{ _id: "r1", event: { title: "Event" } }];
      RSVP.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockRsvps),
        }),
      });

      await rsvpController.myRsvpsPage(req, res);

      expect(RSVP.find).toHaveBeenCalledWith(
        expect.objectContaining({ user: userId, status: "attending" }),
      );
      expect(res.render).toHaveBeenCalledWith("rsvp/my-rsvps", {
        rsvps: mockRsvps,
      });
    });

    test("sends error message on database failure", async () => {
      RSVP.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockRejectedValue(new Error("DB error")),
        }),
      });

      await rsvpController.myRsvpsPage(req, res);

      expect(res.send).toHaveBeenCalledWith("Error loading RSVP page.");
    });
  });
});
