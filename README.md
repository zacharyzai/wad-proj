# Campus Event Board

A full-stack web application for managing and attending campus events.
Built with Express.js, MongoDB, Mongoose, EJS templates, and role-based access control.

## What this repo contains
- User registration and login (`/auth/register`, `/auth/login`)
- Student events browsing and RSVP management
- Organizer event CRUD (create, update, delete)
- Admin dashboard for user and event management
- Reviews on events with owner/admin permissions
- Profile management (view/edit/delete)

## Setup (local)

1. Clone and `cd` into project:

```bash
git clone <your-repo-url> && cd wad-proj
```

2. Install dependencies:

```bash
npm install
```

3. Create `config.env` in project root with:

```env
DB=<your-mongodb-connection-string>
SESSION_SECRET=<secret-key>
PORT=8000
```

4. Start app:

```bash
nodemon server.js
```

Or if you do not have nodemon installed:
```bash
node server.js
```

5. Open browser:

```txt
http://localhost:8000
```

6. Login/register:
- Register new user: `/auth/register`
- Login: `/auth/login`

> No built-in account seeding is in this code. Create your own user(s) through signup or through MongoDB directly if needed.

## Authentication / roles
- Roles: `student`, `organizer`, `admin`
- Default registration role: `student`
- Organizer-only routes under `/organizer` and `/events` create/update/delete
- Admin-only routes under `/admin`

## 📌 Main routes (current)

### Auth
- GET `/auth/register`
- POST `/auth/register`
- GET `/auth/login`
- POST `/auth/login`
- GET `/auth/logout`

### Events (Auth required)
- GET `/events` (all events page)
- GET `/events/create-event` (organizer only)
- POST `/events/create-event` (organizer only)
- GET `/events/update-event` (organizer only, query contains `id`)
- POST `/events/update-event` (organizer only)
- GET `/events/delete-event` (organizer only, query contains `id`)
- POST `/events/delete-event` (organizer only)
- GET `/events/:id` (event detail)

### Reviews (Auth required)
- GET `/events/:id/review` (add review form)
- POST `/events/:id/review`
- GET `/events/:id/review/:reviewId/edit`
- POST `/events/:id/review/:reviewId/edit`
- POST `/events/:id/review/:reviewId/delete` (admin only)

### RSVP (Auth required)
- POST `/rsvp/:id/rsvp`
- POST `/rsvp/:id/unrsvp`
- GET `/rsvp/my-rsvps`

### Profile (Auth required)
- GET `/profile`
- GET `/profile/edit`
- POST `/profile/edit`
- POST `/profile/delete`

### Organizer
- GET `/organizer/organizer-analytics`

### Admin
- GET `/admin/dashboard`
- GET `/admin/create-user`
- POST `/admin/create-user`
- GET `/admin/edit-user/:id`
- POST `/admin/edit-user/:id`
- POST `/admin/delete-user/:id`

## Views (EJS)
- `views/auth/login.ejs`, `views/auth/register.ejs`
- `views/events/*` (event list, detail, create, update, delete)
- `views/review/*` (create/edit review)
- `views/rsvp/my-rsvps.ejs`
- `views/profile/*`
- `views/admin/*`, `views/organizer/*`

## Tests

Run unit tests:

```bash
npm test
```
