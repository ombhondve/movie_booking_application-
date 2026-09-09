# Movie Booking Application — Setup & Run Guide

This guide covers everything needed to get the project running locally on
Windows/macOS/Linux, including the new features (booking cancellation,
booking IDs, digital tickets, notifications, profile, watchlist, admin
analytics, and search/filter).

---

## 1. Project structure

```
movie_booking_application-/
├── client/                  React + Vite frontend
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── components/
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/
│   │   │   └── admin/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
└── server/                  Express + MongoDB (Mongoose) backend
    ├── models/
    ├── routes/
    ├── utils/
    ├── middleware/auth.js
    ├── createAdmin.js
    ├── backfillBookingIds.js
    ├── server.js
    ├── env.example
    └── package.json
```

---

## 2. Prerequisites

| Tool | Version | Check with |
|---|---|---|
| Node.js | 18+ (20+ recommended) | `node -v` |
| npm | comes with Node | `npm -v` |
| MongoDB | Atlas (cloud) **or** local MongoDB | — |
| Git | any recent version | `git --version` |

You do **not** need MongoDB installed locally if you use a free
[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster —
that's what `server/env.example` is set up for by default.

---

## 3. Backend setup (`server/`)

### 3.1 Install dependencies

```powershell
cd "D:\New folder\movie_booking_application-\server"
npm install
```

### 3.2 Create your `.env` file

Copy the example and fill in real values:

```powershell
copy env.example .env
```

Edit `server/.env`:

```env
PORT=5000

# Your MongoDB connection string (Atlas or local)
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/movieBookingDB?appName=MovieBookingDB

# Any long random string — used to sign login tokens
JWT_SECRET=replace_with_a_long_random_secret

# Seeds one admin account automatically on first server startup
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeThisPassword123
```

> If you use a **local** MongoDB instead of Atlas, use something like
> `MONGO_URI=mongodb://127.0.0.1:27017/movieBookingDB` and make sure
> `mongod` is running first.

### 3.3 Confirm every backend file exists

The new features added these files on top of the original project. Before
starting the server, verify each one is present and matches what was given
to you (a single missing/misplaced file will crash the server on boot):

| File | Status |
|---|---|
| `server/models/Booking.js` | modified — has `bookingId` field |
| `server/models/User.js` | modified — has `watchlist` field |
| `server/models/Notification.js` | **new** |
| `server/routes/bookings.js` | modified — generates `bookingId`, sends cancel notification |
| `server/routes/shows.js` | modified — sends cancel/reschedule notifications |
| `server/routes/notifications.js` | **new** |
| `server/routes/users.js` | **new** |
| `server/utils/notify.js` | **new** |
| `server/backfillBookingIds.js` | **new** |
| `server/server.js` | modified — wires up the new routes |

Quick check (PowerShell, from `server/`):

```powershell
dir models\Notification.js, routes\notifications.js, routes\users.js, utils\notify.js, backfillBookingIds.js
```

If any of these report "Cannot find path", that file is missing — go back
and create it before continuing.

### 3.4 Start the backend

```powershell
npm run dev
```

Expected output:

```
[nodemon] starting `node server.js`
MongoDB connected
Database: movieBookingDB
Admin created successfully!        (only on first run)
Admin email: admin@example.com
Admin role: admin
Server running on port 5000
```

Leave this terminal window running. The API is now live at
`http://localhost:5000/api`.

**Sanity check:** open `http://localhost:5000/` in a browser — you should
see `Movie Booking API is running`.

---

## 4. Frontend setup (`client/`)

Open a **second** terminal window (keep the backend running in the first).

### 4.1 Install dependencies

```powershell
cd "D:\New folder\movie_booking_application-\client"
npm install
```

### 4.2 Create your `.env` file

```powershell
copy .env.example .env
```

`client/.env` should contain:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4.3 Confirm every frontend file exists

| File | Status |
|---|---|
| `client/src/components/Modal.jsx` | **new** |
| `client/src/components/TicketView.jsx` | **new** |
| `client/src/pages/Profile.jsx` | **new** |
| `client/src/pages/Watchlist.jsx` | **new** |
| `client/src/components/MovieCard.jsx` | modified — watchlist heart button |
| `client/src/components/Navbar.jsx` | modified — notification bell, Watchlist/Profile links |
| `client/src/pages/MovieList.jsx` | modified — search + genre/language filters |
| `client/src/pages/MyBookings.jsx` | modified — cancel button, ticket modal, booking ID |
| `client/src/pages/ShowDetail.jsx` | modified — seat legend/count wording |
| `client/src/pages/admin/AdminDashboard.jsx` | modified — analytics |
| `client/src/pages/admin/AllBookings.jsx` | modified — search/filter, booking ID column |
| `client/src/App.jsx` | modified — routes for `/watchlist` and `/profile` |

```powershell
dir src\components\Modal.jsx, src\components\TicketView.jsx, src\pages\Profile.jsx, src\pages\Watchlist.jsx
```

### 4.4 Start the frontend

```powershell
npm run dev
```

Expected output:

```
  VITE v5.x.x  ready in ... ms
  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser.

---

## 5. First-time usage

1. **Log in as admin** using the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in
   `server/.env`.
2. Go to **Admin → Manage Movies** and add a movie.
3. Go to **Admin → Manage Shows** and schedule a show for that movie.
4. **Register a normal user account** (or log out and use "Sign up").
5. As that user: browse **Now Showing**, open the movie, pick seats, and
   book. You'll get a booking ID, and can view a digital ticket or cancel
   the booking from **My Bookings**.
6. Try the **heart icon** on a movie card to add it to your **Watchlist**.
7. As admin, cancel or reschedule that show — the user should see a
   notification (bell icon, top right) and an update on **My Bookings**.

---

## 6. Common problems & fixes

### `Cannot find module './routes/notifications'` (or similar)
A required file is missing on disk. Check section 3.3 above and create the
missing file with the exact content you were given — nothing needs to be
installed via npm for this, they're plain project files.

### Two `module.exports` in one file / router doesn't work
If you accidentally pasted a Mongoose **schema** (`models/Booking.js`
content) into a **route** file (`routes/bookings.js`), the file will have
two `module.exports` statements and only the last one wins. Each file
should contain only what its name says: `models/*.js` files define
schemas, `routes/*.js` files define Express routers. Re-copy each file's
content into its own correct path.

### `MongoDB connection error`
- Double-check `MONGO_URI` in `server/.env` — no angle brackets `<...>`
  should remain, and your Atlas user's password must not contain characters
  that need URL-encoding (or encode them, e.g. `@` → `%40`).
- If using Atlas, confirm your current IP is allow-listed under
  **Network Access** in the Atlas dashboard.

### Frontend loads but API calls fail / blank pages (e.g. Watchlist)
- Confirm the backend terminal shows no errors and is still running.
- Open the browser DevTools → Network tab, click the broken feature, and
  check the failing request's status code and response body.
- Confirm `client/.env` points to the correct backend port
  (`VITE_API_URL=http://localhost:5000/api`).
- If a page is blank with no network errors at all, the route/import in
  `client/src/App.jsx` is likely missing — see section 4.3.

### Port already in use
- Backend: change `PORT` in `server/.env`, then update
  `VITE_API_URL` in `client/.env` to match.
- Frontend: Vite will automatically offer the next free port if `5173` is
  taken.

### Notification bell shows nothing / stays at 0
Notifications are created only when: a user cancels their own booking, an
admin cancels a show, or an admin reschedules a show. Booking a seat by
itself does not create a notification — that's expected.

---

## 7. Useful commands reference

| Action | Command | Run from |
|---|---|---|
| Install backend deps | `npm install` | `server/` |
| Run backend (auto-restart) | `npm run dev` | `server/` |
| Run backend (no auto-restart) | `npm start` | `server/` |
| Install frontend deps | `npm install` | `client/` |
| Run frontend dev server | `npm run dev` | `client/` |
| Build frontend for production | `npm run build` | `client/` |
| Preview production build | `npm run preview` | `client/` |