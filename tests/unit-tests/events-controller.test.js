const eventController = require("../../controller/events-controller");
const Event = require("../../models/event-models");
const Notification = require("../../models/notification-models");

jest.mock("../../models/event-models");
jest.mock("../../models/notification-models");
jest.mock("../../models/rsvp-models");
jest.mock("../../services/eventServices", () => ({
  deleteEventCascade: jest.fn().mockResolvedValue(),
}));

const { deleteEventCascade } = require("../../services/eventServices");

describe("Events Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      session: { userId: "64f29c83c8f1f7a2d8e394f0", role: "admin" },
    };
    res = {
      render: jest.fn(),
      send: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // create event tests
  describe("createEvent", () => {
    test("renders error listing 'Title is required' when title is missing", async () => {
      req.body = {
        description: "Desc",
        date: "2030-01-01",
        location: "Campus Green",
        category: ["General"],
      };
      await eventController.createEvent(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "events/create-event",
        expect.objectContaining({
          errors: expect.arrayContaining(["Title is required"]),
        }),
      );
    });

    test("renders error listing 'Description is required' when description is missing", async () => {
      req.body = {
        title: "Fest",
        date: "2030-01-01",
        location: "Campus Green",
        category: ["Sports"],
      };
      await eventController.createEvent(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "events/create-event",
        expect.objectContaining({
          errors: expect.arrayContaining(["Description is required"]),
        }),
      );
    });

    test("renders error listing 'At least one category must be selected' when category is empty", async () => {
      req.body = {
        title: "Fest",
        description: "Fun festival",
        date: "2030-01-01",
        location: "Campus",
        category: [],
      };
      await eventController.createEvent(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "events/create-event",
        expect.objectContaining({
          errors: expect.arrayContaining(["At least one category must be selected"]),
        }),
      );
    });

    test("renders error listing 'Location is required' when location is missing", async () => {
      req.body = {
        title: "Fest",
        description: "Fun festival",
        date: "2030-01-01",
        location: "",
        category: ["General"],
      };
      await eventController.createEvent(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "events/create-event",
        expect.objectContaining({
          errors: expect.arrayContaining(["Location is required"]),
        }),
      );
    });

    test("renders multiple specific errors when several fields are missing at once", async () => {
      req.body = { category: [] };
      await eventController.createEvent(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "events/create-event",
        expect.objectContaining({
          errors: expect.arrayContaining([
            "Title is required",
            "Description is required",
            "Date and time is required",
            "Location is required",
            "At least one category must be selected",
          ]),
        }),
      );
    });

    test("renders error when event date is in the past", async () => {
      req.body = {
        title: "Old Fest",
        description: "Past event",
        date: "2000-01-01",
        location: "Campus",
        category: ["General"],
      };
      await eventController.createEvent(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "events/create-event",
        expect.objectContaining({
          error: "Event date cannot be in the past.",
        }),
      );
    });

    test("renders error when maxAttendees is 0", async () => {
      req.body = {
        title: "Fest",
        description: "Fun",
        date: "2030-01-01",
        location: "Campus",
        category: ["General"],
        maxAttendees: "0",
      };
      await eventController.createEvent(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "events/create-event",
        expect.objectContaining({
          errors: expect.arrayContaining([
            "Maximum capacity must be a whole number of at least 1, or leave it blank for unlimited",
          ]),
        }),
      );
    });

    test("renders error when maxAttendees is negative", async () => {
      req.body = {
        title: "Fest",
        description: "Fun",
        date: "2030-01-01",
        location: "Campus",
        category: ["General"],
        maxAttendees: "-5",
      };
      await eventController.createEvent(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "events/create-event",
        expect.objectContaining({
          errors: expect.arrayContaining([
            "Maximum capacity must be a whole number of at least 1, or leave it blank for unlimited",
          ]),
        }),
      );
    });

    test("renders error when maxAttendees is a decimal number", async () => {
      req.body = {
        title: "Fest",
        description: "Fun",
        date: "2030-01-01",
        location: "Campus",
        category: ["General"],
        maxAttendees: "10.5",
      };
      await eventController.createEvent(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "events/create-event",
        expect.objectContaining({
          errors: expect.arrayContaining([
            "Maximum capacity must be a whole number of at least 1, or leave it blank for unlimited",
          ]),
        }),
      );
    });

    test("creates event and redirects on valid input", async () => {
      req.body = {
        title: "Hackathon",
        description: ".Hack Hackathon",
        date: "2030-06-01",
        location: "SCIS1 SR2-1",
        category: ["Hackathons"],
        maxAttendees: "50",
      };
      Event.create.mockResolvedValue({ _id: "evt99" });

      await eventController.createEvent(req, res);

      expect(Event.create).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/events?success=true");
    });

    test("blank maxAttendees is allowed (unlimited)", async () => {
      req.body = {
        title: "Fest",
        description: "Fun",
        date: "2030-06-01",
        location: "Campus",
        category: ["General"],
        maxAttendees: "",
      };
      Event.create.mockResolvedValue({ _id: "evt101" });

      await eventController.createEvent(req, res);

      expect(res.redirect).toHaveBeenCalledWith("/events?success=true");
    });

    test("handles a single category string by wrapping it into an array", async () => {
      req.body = {
        title: "Workshop",
        description: "Learn stuff",
        date: "2030-06-01",
        location: "Campus",
        category: "General", // string, not array
      };
      Event.create.mockResolvedValue({ _id: "evt100" });

      await eventController.createEvent(req, res);

      expect(Event.create).toHaveBeenCalledWith(
        expect.objectContaining({ category: ["General"] }),
      );
      expect(res.redirect).toHaveBeenCalledWith("/events?success=true");
    });

    test("renders error on database failure during creation", async () => {
      req.body = {
        title: "Hackathon",
        description: "Desc",
        date: "2030-06-01",
        location: "Campus",
        category: ["General"],
      };
      Event.create.mockRejectedValue(new Error("DB error"));

      await eventController.createEvent(req, res);

      expect(res.render).toHaveBeenCalledWith(
        "events/create-event",
        expect.objectContaining({
          error: "An error occured while saving to database",
        }),
      );
    });
  });

  // update event tests
  describe("updateEvent", () => {
    test("renders error listing 'Title is required' when title is missing", async () => {
      req.query.eventId = "evt1";
      req.body = {
        description: "Desc",
        date: "2030-01-01",
        location: "Campus Green",
        category: ["General"],
      };
      Event.findById.mockResolvedValue({
        _id: "evt1",
        organiser: { toString: () => "64f29c83c8f1f7a2d8e394f0" },
        attendees: [],
      });
      await eventController.updateEvent(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "events/update-event",
        expect.objectContaining({
          errors: expect.arrayContaining(["Title is required"]),
        }),
      );
    });

    test("renders error listing category message when category is empty", async () => {
      req.query.eventId = "evt1";
      req.body = {
        title: "Event",
        description: "Desc",
        date: "2030-01-01",
        location: "Campus",
        category: [],
      };
      Event.findById.mockResolvedValue({
        _id: "evt1",
        organiser: { toString: () => "64f29c83c8f1f7a2d8e394f0" },
        attendees: [],
      });
      await eventController.updateEvent(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "events/update-event",
        expect.objectContaining({
          errors: expect.arrayContaining(["At least one category must be selected"]),
        }),
      );
    });

    test("renders error when maxAttendees is 0 on update", async () => {
      req.query.eventId = "evt1";
      req.body = {
        title: "Fest",
        description: "Fun",
        date: "2030-01-01",
        location: "Campus",
        category: ["General"],
        maxAttendees: "0",
      };
      Event.findById.mockResolvedValue({
        _id: "evt1",
        organiser: { toString: () => "64f29c83c8f1f7a2d8e394f0" },
        attendees: [],
      });
      await eventController.updateEvent(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "events/update-event",
        expect.objectContaining({
          errors: expect.arrayContaining([
            "Maximum capacity must be a whole number of at least 1, or leave it blank for unlimited",
          ]),
        }),
      );
    });

    test("renders error when maxAttendees is negative on update", async () => {
      req.query.eventId = "evt1";
      req.body = {
        title: "Fest",
        description: "Fun",
        date: "2030-01-01",
        location: "Campus",
        category: ["General"],
        maxAttendees: "-3",
      };
      Event.findById.mockResolvedValue({
        _id: "evt1",
        organiser: { toString: () => "64f29c83c8f1f7a2d8e394f0" },
        attendees: [],
      });
      await eventController.updateEvent(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "events/update-event",
        expect.objectContaining({
          errors: expect.arrayContaining([
            "Maximum capacity must be a whole number of at least 1, or leave it blank for unlimited",
          ]),
        }),
      );
    });

    test("sends unauthorized when non-admin tries to edit another organizer's event", async () => {
      req.session.role = "organizer";
      req.session.userId = "userId1";
      req.query.eventId = "evt1";
      req.body = {
        title: "Updated",
        description: "Desc",
        date: "2030-01-01",
        location: "Campus",
        category: ["General"],
      };
      Event.findById.mockResolvedValue({
        _id: "evt1",
        organiser: { toString: () => "differentOrganizerId" },
        attendees: [],
      });

      await eventController.updateEvent(req, res);

      expect(res.send).toHaveBeenCalledWith(
        "Unauthorized: You can only modify your own events.",
      );
    });

    test("allows organizer to update their own event", async () => {
      req.session.role = "organizer";
      req.session.userId = "userId1";
      req.query.eventId = "evt1";
      req.body = {
        title: "My Updated Event",
        description: "Desc",
        date: "2030-01-01",
        location: "Campus",
        category: ["General"],
      };
      Event.findById.mockResolvedValue({
        _id: "evt1",
        organiser: { toString: () => "userId1" },
        attendees: [],
      });
      Event.findByIdAndUpdate.mockResolvedValue({
        title: "My Updated Event",
        attendees: [],
      });

      await eventController.updateEvent(req, res);

      expect(res.redirect).toHaveBeenCalledWith("/events?success=true");
    });

    test("sends notifications to attendees on successful update", async () => {
      req.session.role = "admin";
      req.query.eventId = "evt1";
      req.body = {
        title: "Updated Hackathon",
        description: "Updated Desc",
        date: "2030-06-01",
        location: "SCIS",
        category: ["General"],
      };
      const attendeeId = "attendee123";
      Event.findById.mockResolvedValue({
        _id: "evt1",
        organiser: { toString: () => "organizer123" },
        attendees: [attendeeId],
      });
      Event.findByIdAndUpdate.mockResolvedValue({
        title: "Updated Hackathon",
        attendees: [{ toString: () => attendeeId }],
      });
      Notification.insertMany.mockResolvedValue({});

      await eventController.updateEvent(req, res);

      expect(Event.findByIdAndUpdate).toHaveBeenCalled();
      expect(Notification.insertMany).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/events?success=true");
    });
  });

  // delete event tests
  describe("deleteEvent", () => {
    test("renders error when no events are selected", async () => {
      req.body = {}; // deleteEventIds is undefined
      Event.find.mockResolvedValue([]);

      await eventController.deleteEvent(req, res);

      expect(res.render).toHaveBeenCalledWith(
        "events/delete-events",
        expect.objectContaining({
          error: "Please select at least one event to delete.",
        }),
      );
    });

    test("sends unauthorized when organizer tries to delete another organizer's event", async () => {
      req.session.role = "organizer";
      req.session.userId = "userId1";
      req.body = { deleteEventIds: "evt1" };
      Event.find.mockResolvedValue([
        {
          _id: "evt1",
          organiser: { toString: () => "differentOrganizerId" },
          attendees: [],
        },
      ]);

      await eventController.deleteEvent(req, res);

      expect(res.send).toHaveBeenCalledWith(
        "Unauthorized: You can only delete your own events.",
      );
    });

    test("deletes events and redirects on success for admin", async () => {
      req.session.role = "admin";
      req.body = { deleteEventIds: ["evt1", "evt2"] };
      Event.find.mockResolvedValue([
        {
          _id: "evt1",
          title: "Event 1",
          attendees: [],
          organiser: { toString: () => "org1" },
        },
        {
          _id: "evt2",
          title: "Event 2",
          attendees: [],
          organiser: { toString: () => "org2" },
        },
      ]);
      Notification.insertMany.mockResolvedValue({});

      await eventController.deleteEvent(req, res);

      expect(deleteEventCascade).toHaveBeenCalledWith(["evt1", "evt2"]);
      expect(res.redirect).toHaveBeenCalledWith("/events?success=true");
    });

    test("sends notifications to attendees when deleting an event with RSVPs", async () => {
      req.session.role = "admin";
      req.session.userId = "adminId";
      req.body = { deleteEventIds: "evt1" };
      const attendeeId = "attendee999";
      Event.find.mockResolvedValue([
        {
          _id: "evt1",
          title: "Cancelled Event",
          attendees: [{ toString: () => attendeeId }],
          organiser: { toString: () => "org1" },
        },
      ]);
      Notification.insertMany.mockResolvedValue({});

      await eventController.deleteEvent(req, res);

      expect(Notification.insertMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            recipient: expect.anything(),
            message: expect.stringContaining("Cancelled Event"),
          }),
        ]),
      );
    });
  });

  // view event details
  describe("viewEventDetails", () => {
    test("sends error when event is not found", async () => {
      req.params.id = "evt1";
      Event.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      await eventController.viewEventDetails(req, res);

      expect(res.send).toHaveBeenCalledWith("Event not found.");
    });

    test("sends 'Event not found.' on invalid ObjectId (CastError)", async () => {
      req.params.id = "notanid";
      const castError = new Error("Cast to ObjectId failed");
      castError.name = "CastError";
      Event.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockRejectedValue(castError),
          }),
        }),
      });

      await eventController.viewEventDetails(req, res);

      expect(res.send).toHaveBeenCalledWith("Event not found.");
    });

    test("renders event details when event is found", async () => {
      req.params.id = "evt1";
      const mockEvent = {
        _id: "evt1",
        title: "Hackathon",
        organiser: { name: "Alice" },
        reviews: [],
        attendees: [],
      };
      Event.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockEvent),
          }),
        }),
      });

      await eventController.viewEventDetails(req, res);

      expect(res.render).toHaveBeenCalledWith(
        "events/event-details",
        expect.objectContaining({ event: mockEvent }),
      );
    });

    test("sends error on unexpected database failure", async () => {
      req.params.id = "evt1";
      Event.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockRejectedValue(new Error("DB error")),
          }),
        }),
      });

      await eventController.viewEventDetails(req, res);

      expect(res.send).toHaveBeenCalledWith("Error loading event details.");
    });
  });
});
