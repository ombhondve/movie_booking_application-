# Movie Booking Application

Full-stack MERN movie booking system with:

- User registration and login
- Movie browsing and show listing
- Seat booking with overbooking protection
- User booking history
- Admin dashboards for movies, shows, and all bookings

## Project Structure

- `client/` React frontend
- `server/` Express and MongoDB backend

## Setup

1. Install dependencies in both folders:

```bash
cd server
npm install
cd ../client
npm install
```

2. Create environment files:

- `server/.env`
- `client/.env`

Use the example files in the repo as a guide.

3. Start MongoDB locally or provide a MongoDB Atlas connection string.

4. Run the backend:

```bash
cd server
npm run dev
```

5. Run the frontend:

```bash
cd client
npm run dev
```

## Environment Variables

### `server/.env`

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/movie_booking
JWT_SECRET=replace_with_a_long_random_secret
```

### `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

## Features

- Admin can create, update, and delete movies
- Admin can create, update, and delete shows
- Admin can review all bookings
- Users can browse movies, view shows, and book seats
- Users can view their own bookings
- Passwords are hashed with bcrypt
- Seat booking prevents overselling

## Notes

- To test admin features, register a user with the `admin` role from the backend during local development.
- The backend exposes REST endpoints under `/api/auth`, `/api/movies`, `/api/shows`, and `/api/bookings`.
