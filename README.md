# Movie Booking Application

Full-stack MERN movie booking system with role-based access (Admin / User), CRUD management for movies and shows, and seat booking with overbooking protection.

## Features

- User registration and login (JWT-based auth, passwords hashed with bcrypt)
- Movie browsing and show listings (public)
- Seat booking with atomic overbooking protection
- Users can view their own booking history
- Admin dashboard: add/edit/delete movies, create/manage shows, view all bookings across all users
- Form validation with loading and error states throughout

## Project Structure

- `server/` — Express + MongoDB (Mongoose) REST API
- `client/` — React frontend (Vite)

## Setup

### 1. Install dependencies

```bash
cd server
npm install
cd ../client
npm install
```

### 2. Configure environment variables

**`server/.env`** (copy from `server/.env.example`):

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/movieBookingDB?appName=MovieBookingDB
JWT_SECRET=<a long random string>
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<choose a password>
```

Use a free [MongoDB Atlas](https://mongodb.com/cloud/atlas) cluster for `MONGO_URI` — no local MongoDB install needed.

`ADMIN_EMAIL` / `ADMIN_PASSWORD` are used **once, automatically, on server startup** by `server/createAdmin.js` to seed the one admin account for this project. There is no admin signup flow — self-registration through the app always creates a regular `user` account. To log in as admin, use these exact credentials.

**`client/.env`** (copy from `client/.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the backend

```bash
cd server
npm run dev
```

You should see `MongoDB connected` and either `Admin created successfully!` (first run) or `Admin account already exists.` (subsequent runs), followed by `Server running on port 5000`.

### 4. Run the frontend

```bash
cd client
npm run dev
```

Opens at `http://localhost:5173`.

## Using the app

1. Log in as admin using the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `server/.env`.
2. Add a movie, then add a show for that movie (date, time, theatre, total seats).
3. Register a regular user account, log in as that user.
4. Browse movies → select a show → pick a seat count → confirm booking.
5. Check "My Bookings" as the user, and the "All Bookings" tab as the admin.

## API Overview

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/movies`, `POST/PUT/DELETE /api/movies/:id` (admin-only for writes)
- `GET /api/shows`, `POST/PUT/DELETE /api/shows/:id` (admin-only for writes)
- `POST /api/bookings`, `GET /api/bookings/mine`, `GET /api/bookings/all` (admin-only)

Overbooking is prevented with an atomic `findOneAndUpdate` (`availableSeats: { $gte: seatsBooked }` + `$inc`), so concurrent bookings cannot oversell seats.
