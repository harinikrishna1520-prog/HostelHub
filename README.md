# HostelHub

HostelHub is a MERN hostel management mini-project for students and hostel administrators. Students can check room details, submit image-supported complaints, track progress and read notices. Administrators can review requests, manage residents and room assignments, publish notices and see live hostel statistics.

## Features

- Student registration and shared login for students and administrators.
- Password hashing with bcryptjs, seven-day JWT sessions and role-protected routes.
- Student dashboards and complaint history backed by MongoDB queries.
- Complaint image uploads (JPG, PNG, WebP or GIF, up to 5 MB) stored in `server/uploads`.
- Administrator complaint search/filtering and status updates.
- Room CRUD, capacity checks, occupancy status and resident assignment.
- Student directory, searchable notices and administrator notice CRUD.
- Responsive React interface with loading, error and empty states.

## Technology

- Frontend: React, Vite, JavaScript, React Router DOM, CSS, Axios
- Backend: Node.js, Express, JavaScript, Multer, CORS, dotenv
- Database: MongoDB Atlas with Mongoose
- Authentication: JWT and bcryptjs

## Project Structure

```text
HostelHub/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── server/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── scripts/
    ├── uploads/
    ├── server.js
    └── package.json
```

## Requirements

- Node.js 20 or later and npm
- A MongoDB Atlas cluster and database user

## MongoDB Atlas

1. Create a free cluster in MongoDB Atlas.
2. Under **Database Access**, create a database user and password.
3. Under **Network Access**, allow the development machine's IP address. Avoid allowing access from everywhere for a deployed database.
4. Choose **Connect → Drivers**, copy the Node.js connection string and replace its username, password and database name. URL-encode special characters in the username or password.
5. In a terminal, from the repository root, copy `server/.env.example` to `server/.env`, then put the Atlas URI and a long random JWT secret in `server/.env`:

```dotenv
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=<long-random-secret>
CLIENT_ORIGIN=http://localhost:5173
```

Never commit `server/.env`; it is ignored by Git. A real Atlas connection string is intentionally not included in this project.

## Install and Run

Open two terminals at the project root.

Backend terminal:

```powershell
cd server
npm install
npm run dev
```

The API listens at `http://localhost:5000`. Check `http://localhost:5000/api/health` after the Atlas connection succeeds.

Frontend terminal:

```powershell
cd client
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173`. The API base URL defaults to `http://localhost:5000/api`; to change it, create `client/.env` with `VITE_API_URL=http://localhost:5000/api` and restart Vite.

## Create the First Administrator

The public registration endpoint always creates a `student`; it does not accept a role field. After configuring `server/.env`, create an administrator from the `server` directory:

```powershell
npm run seed:admin -- "Hostel Administrator" admin@example.com "use-a-unique-password-of-12-or-more-characters"
```

The seed script requires a password of at least 12 characters and stores only its bcrypt hash. The password is supplied as a command-line argument, so do not use a shared machine or a password you use elsewhere. Sign in through the regular `/login` page. Additional admins should be provisioned by a trusted operator, not by student registration.

To create room records for the demonstration, sign in as admin and add rooms in **Rooms**; select residents in the room form to assign them. The selected students' profile room/block fields update with the assignment.

## API Overview

All API routes are prefixed with `/api`. Protected endpoints require `Authorization: Bearer <token>`.

| Area | Endpoints | Access |
| --- | --- | --- |
| Authentication | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | Public register/login; authenticated profile |
| Students | `GET /students`, `GET /students/:id` | Admin |
| Rooms | `GET /rooms`, `GET /rooms/:id`, `POST /rooms`, `PUT /rooms/:id`, `DELETE /rooms/:id` | Student sees own room; room management is admin-only |
| Complaints | `POST /complaints`, `GET /complaints`, `GET /complaints/:id`, `PUT /complaints/:id/status`, `DELETE /complaints/:id` | Students create/view their own; admin views all and manages status |
| Notices | `GET /notices`, `POST /notices`, `PUT /notices/:id`, `DELETE /notices/:id` | Authenticated read; admin write |
| Dashboards | `GET /dashboard/student`, `GET /dashboard/admin` | Student and admin respectively |
| Room details | `GET /complaints/room/me` | Authenticated student |
| Health | `GET /health` | Public |

Complaint filters accept `search`, `status`, `category` and `hostelBlock`; student results remain scoped to the signed-in student. Student directory filters accept `search` and `block`.

## Database Models

- **User:** name, unique email, bcrypt password hash, phone, role, room number, hostel block and timestamps.
- **Room:** room number, hostel block, floor, type, capacity, user references for occupants and calculated occupancy status.
- **Complaint:** student reference, room/block snapshot, category, description, image path, status and timestamps.
- **Notice:** title, description, category, author reference and timestamps.

## Manual Test Checklist

With Atlas configured and the backend/frontend running:

1. Create an admin with the seed command, then register a student from `/register`.
2. Sign in as student; verify dashboard totals are zero initially and check the room details response/state.
3. Sign in as admin; create a room and assign the student, then confirm the student sees their room and occupant list.
4. As student, create a complaint with and without an image. Confirm it appears in complaint history, search/filter it and open its detail timeline.
5. As admin, filter the complaint, update its status and confirm the student sees the updated status and timeline.
6. As admin, publish, edit and delete a notice; verify it is visible in the student notices page.
7. Search/filter the student directory and add, edit and delete an unoccupied room.
8. Confirm a student visiting an admin URL is redirected, and a student cannot call admin-only APIs (403).
9. Sign out and sign back in; refresh a private page to verify JWT session restoration.

Automated checks available in this checkout: `npm run build --prefix client` and `node --check` for server JavaScript files. Full API/browser testing requires a configured MongoDB Atlas URI and is not simulated with seeded fake application data.

## Screenshots

Add application screenshots here after running the project locally.

## Future Improvements

- Add automated API integration tests against a dedicated test database.
- Persist complaint status history for a timestamped, auditable timeline.
- Add pagination and configurable user profile editing.
- Move uploaded images to managed object storage for production deployments.
- Add operational logging, rate limiting and deployment configuration.