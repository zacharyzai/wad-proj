const eventController = require("../../controller/events-controller");
const Event = require("../../models/event-models");

jest.mock("../../models/event-models");

describe("Events Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      session: { userId: "user123", role: "admin" },
    };
    res = {
      render: jest.fn(),
      send: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // create eventtest
  describe("createEvent", () => {
    test("renders error when title is missing", async () => {
      req.body = {
        description: "Desc",
        date: "2026-01-01",
        location: "Campus Green",
        category: ["General"],
      };
      await eventController.createEvent(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "events/create-event",
        expect.objectContaining({
          error: "All fields are required",
        }),
      );
    });

    test("renders error when description is missing", async () => {
      req.body = {
        title: "Fest",
        date: "2026-01-01",
        location: "Campus Green",
        category: ["Sports"],
      };
      await eventController.createEvent(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "events/create-event",
        expect.objectContaining({
          error: "All fields are required",
        }),
      );
    });

    test("creates event and redirects on valid input", async () => {
      req.body = {
        title: "Hackathon",
        description: ".Hack Hackathon",
        date: "2026-06-01",
        location: "SCIS1 SR2-1",
        category: ["Hackathons"],
        maxAttendees: "50",
      };
      Event.create.mockResolvedValue({ _id: "evt99" });

      await eventController.createEvent(req, res);

      expect(Event.create).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/events?success=true");
    });
  });

  // update test

  describe("updateEvent", () => {
    test("renders error when title is missing", async () => {
      req.query.eventId = "evt1";
      req.body = {
        description: "Desc",
        date: "2026-01-01",
        location: "Campus Green",
        category: ["General"],
      };
      await eventController.updateEvent(req, res);
      expect(res.render).toHaveBeenCalledWith(
        "events/update-event",
        expect.objectContaining({
          error: "All fields are required",
        }),
      );
    });

    test("updates event and redirects on valid input", async () => {
      req.query.eventId = "evt1";
      req.body = {
        title: "Updated",
        description: "New Desc",
        date: "2026-06-01",
        location: "Aclove",
        category: ["Discussions"],
      };
      Event.findByIdAndUpdate.mockResolvedValue({});

      await eventController.updateEvent(req, res);

      expect(res.redirect).toHaveBeenCalledWith("/events?success=true");
    });
  });

  // delete event

  describe("deleteEvent", () => {
    test("renders error when no events are selected", async () => {
      req.body = {}; // delete event ids is undefined
      Event.find.mockResolvedValue([]);

      await eventController.deleteEvent(req, res);

      expect(res.render).toHaveBeenCalledWith(
        "events/delete-events",
        expect.objectContaining({
          error: "Please select at least one event to delete.",
        }),
      );
    });
  });
});
