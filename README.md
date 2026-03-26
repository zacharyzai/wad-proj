# Campus Event Board

A full-stack web application for managing and attending campus events, 
built with Express.js, MongoDB, and EJS templates using MVC architecture.

## Features

- **Event Listings**: Browse and filter campus events by category
- **Event Management**: Organizers can create, edit, and delete their own events
- **RSVP System**: Students can RSVP to events, update their status, and cancel
- **User Profiles**: View, edit and delete your personal profile and see your RSVPs
- **Admin Dashboard**: Admins can manage all users and events
- **Authentication**: Secure login and registration with password hashing
- **Authorization**: Role-based access control for students, organizers, and admins

## Tech Stack

- **Backend**: Express.js with MVC architecture
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: HTML with EJS templating
- **Authentication**: bcrypt for password hashing, express-session for sessions
- **Environment**: Node.js

## Setup Instructions

### 1. Install Node.js
Make sure you have Node.js installed on your machine.
Download it from https://nodejs.org if needed.

### 2. Install dependencies
Open a terminal in the project root folder and run:
```bash
npm install
```

### 3. Set up the environment file
Create a file named `config.env` in the project root folder.
Add the following lines to it:
```
DB=mongodb+srv://your-connection-string-here
SESSION_SECRET=anysecretstringhere
```

Replace `mongodb+srv://your-connection-string-here` with the 
actual MongoDB Atlas connection string.

### 4. Run the application
```bash
nodemon server.js
```

Or if you do not have nodemon installed:
```bash
node server.js
```

### 5. Open your browser
```
http://localhost:8000/index.html
```

This will load the home page and redirect you with links to the login and admin page.

## Test Accounts

These accounts are already in the database and ready to use:

| Name | Email | Password | Role |
|---|---|---|---|
| student1 | student@test.com | password | student |
| organizer1 | organizer@test.com | password | organizer |
| admin1 | admin@test.com | password | admin |

You can also register a new account at `/auth/register`.
New accounts are assigned the student role by default.
To create an organizer account, select Organizer from the 
role dropdown during registration.

---

## Usage

### As a Student
1. Register or log in at `http://localhost:8000/auth/login`
2. Browse all events at `/events/list`
3. Filter events by category using the dropdown
4. Click on an event to view details and RSVP
5. View and manage your RSVPs on your profile page at `/profile`
6. Delete your own profile

### As an Organizer
1. Log in with an organizer account
2. Create a new event at `/events/create`
3. Edit or delete your own events from the event detail page
4. You cannot edit or delete events created by other organizers
5. Delete your own profile

### As an Admin
1. Log in with the admin account
2. Access the dashboard at `/admin/dashboard`
3. View all registered users and all events
4. Edit any user's details including their role
5. Delete any user or event from the dashboard

---

## API Endpoints

### Auth
| Method | URL | Description |
|---|---|---|
| GET | `/auth/register` | Show register form |
| POST | `/auth/register` | Submit register form |
| GET | `/auth/login` | Show login form |
| POST | `/auth/login` | Submit login form |
| GET | `/auth/logout` | Logout |

### Events
| Method | URL | Description |
|---|---|---|
| GET | `/events/list` | View all events |
| GET | `/events/detail/:id` | View one event |
| GET | `/events/create` | Show create form (organizer only) |
| POST | `/events/create` | Submit new event (organizer only) |
| GET | `/events/edit/:id` | Show edit form (owner only) |
| POST | `/events/edit/:id` | Submit event edit (owner only) |
| POST | `/events/delete/:id` | Delete event (owner only) |

### RSVP
| Method | URL | Description |
|---|---|---|
| POST | `/rsvp/create/:eventId` | RSVP to an event |
| POST | `/rsvp/update/:rsvpId` | Update RSVP status |
| POST | `/rsvp/cancel/:rsvpId` | Cancel RSVP |

### Profile
| Method | URL | Description |
|---|---|---|
| GET | `/profile` | View your profile |
| GET | `/profile/edit` | Show edit form |
| POST | `/profile/edit` | Submit profile changes |
| POST | `/profile/delete` | Delete own profile |

### Admin
| Method | URL | Description |
|---|---|---|
| GET | `/admin/dashboard` | View all users and events |
| GET | `/admin/edit-user/:id` | Show edit user form |
| POST | `/admin/edit-user/:id` | Submit user edits |
| POST | `/admin/delete-user/:id` | Delete a user |

---

## Database Schemas

### User
- name: String (required)
- email: String (required, unique)
- passwordHash: String (required)
- role: String (student / organizer / admin)
- studentId: String
- faculty: String
- bio: String (max 200 characters)

### Event
- title: String (required)
- description: String (required)
- date: Date (required)
- location: String (required)
- category: String
- organiser: ObjectId → User (required)
- attendees: [ObjectId → User]

### RSVP
- event: ObjectId → Event (required)
- user: ObjectId → User (required)
- status: String (attending / maybe / not attending)
- rsvpDate: Date
- notes: String (max 200 characters)
