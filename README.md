# 🎬 Movie Booking Application

A full-stack movie booking application built using:

- React
- Node.js
- Express.js
- MongoDB
- Mongoose

---

## ✨ Features

### 👤 User

- Register and login
- Browse movies
- Search movies
- Filter movies by genre and language
- View movie details
- Select seats
- Book tickets
- View booking history
- View seat numbers
- View booking ID
- View digital ticket
- Cancel booking
- Receive notifications
- Manage profile
- Add movies to watchlist

### 👑 Admin

- Admin login
- Admin dashboard
- Manage movies
- Manage shows
- View all bookings
- Search and filter bookings
- Cancel shows
- Reschedule shows
- View booking statistics

---

## 🚀 Getting Started

Follow the steps below to run the project on your computer.

### 1. Install Required Software

Before starting, install:
- [Node.js](https://nodejs.org/) — version 18 or higher
- Git
- MongoDB Atlas account or local MongoDB

Check if Node.js and Git are installed:

```bash
node -v
npm -v
git --version
```
*If these commands show version numbers, you are ready.*

### 2. Download the Project

Open Command Prompt / PowerShell / Terminal and run:

```bash
git clone https://github.com/ombhondve/movie_booking_application-.git
```

Then enter the project:

```bash
cd movie_booking_application-
```

The project contains two main parts:

```text
movie_booking_application-
│
├── client/    → Frontend (React)
│
└── server/    → Backend (Node.js + Express)
```
*You need to run both parts.*

### 3. Set Up MongoDB

The easiest option is MongoDB Atlas.
1. Create a MongoDB Atlas account and create a database.
2. You will need your MongoDB connection string. It looks similar to:
   ```text
   mongodb+srv://username:password@cluster.mongodb.net/movieBookingDB
   ```
3. Also make sure your IP address is allowed in MongoDB Atlas:
   `MongoDB Atlas → Network Access → Add IP Address`

### 4. Set Up the Backend

Open a terminal and go to the backend:

```bash
cd server
```

Install the backend packages:

```bash
npm install
```

Create the `.env` file.

**Windows:**
```cmd
copy env.example .env
```

**macOS / Linux:**
```bash
cp env.example .env
```

Now open `server/.env` and add your settings:

```env
PORT=5000
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_SECRET_KEY
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=YourStrongPassword123
```
*Replace `YOUR_MONGODB_CONNECTION_STRING` and `YOUR_SECRET_KEY` with your actual values.*

> ⚠️ **Important:** Never upload your `.env` file to GitHub.

### 5. Start the Backend

Make sure you are inside the `server` folder:

```bash
npm run dev
```

You should see something similar to:
```text
MongoDB connected
Database: movieBookingDB
Server running on port 5000
```
*Keep this terminal open.*

**Test the Backend:**
Open your browser and visit: `http://localhost:5000/`
You should see: `Movie Booking API is running`

### 6. Set Up the Frontend

Open a **new** terminal. Go to the frontend:

```bash
cd client
```

Install the frontend packages:

```bash
npm install
```

Create the `.env` file.

**Windows:**
```cmd
copy .env.example .env
```

**macOS / Linux:**
```bash
cp .env.example .env
```

Open `client/.env` and make sure it contains:

```env
VITE_API_URL=http://localhost:5000/api
```

### 7. Start the Frontend

Inside the `client` folder, run:

```bash
npm run dev
```

You should see something similar to:
```text
VITE ready
Local: http://localhost:5173/
```

Open the URL shown in the terminal. Usually it is `http://localhost:5173`.
🎉 **Your application is now running.**

---

## 📖 Usage Guide

### 👑 8. Login as Admin
The application creates the admin account using the values from `server/.env`.
For example:
```env
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=YourStrongPassword123
```
Use these credentials to log in as admin.

### 🎬 9. Add Your First Movie
After logging in as admin:
`Admin → Manage Movies → Add Movie`
Enter the movie information and save it.

### 🕐 10. Create a Show
Go to: `Admin → Manage Shows → Add Show`
Select: Movie, Date, Time, Theatre / Screen, Seats. 
Save the show.

### 👤 11. Create a User Account
Log out from the admin account. Click **Sign Up**. Create a normal user account and log in.

### 🎟️ 12. Book a Movie
As a normal user:
`Now Showing → Select Movie → Select Show → Select Seats → Book Ticket`

After booking, open **My Bookings**. You can see:
Movie, Date, Time, Seat numbers, Booking ID, Booking status, and Digital ticket.

### ❌ 13. Cancel a Booking
Go to **My Bookings**. Select your booking and click **Cancel Booking**.
Confirm the cancellation. The booking will be marked as *Cancelled* and the seats will become available again.

### 🔄 14. Reschedule a Show
*Only an admin can reschedule a show.*
Go to: `Admin → Manage Shows → Reschedule`
Select the new date and time and confirm. Users who already booked the show will see the updated schedule.

### 🚫 15. Cancel a Show
*Only an admin can cancel a show.*
Go to: `Admin → Manage Shows → Cancel`
Confirm the cancellation. The show will be marked as cancelled. Users who booked the show will be notified. A cancelled show cannot receive new bookings.

### ❤️ 16. Watchlist
Users can add movies to their watchlist using the heart button `♡`.
Open **My Watchlist** to see saved movies.

### 🔔 17. Notifications
Users can receive notifications when:
- A booking is cancelled
- A show is cancelled
- A show is rescheduled

Click the notification bell to view notifications.

### 👤 18. Profile
Users can open **Profile** to view and manage their account information.

### 📊 19. Admin Dashboard
Admins can open **Admin Dashboard**. The dashboard provides information about:
Movies, Shows, Bookings, Confirmed bookings, Cancelled bookings, Upcoming shows, Recent bookings, and Popular movies.

### 🔎 20. Search and Filter Movies
Users can search for movies from the movie listing page. Movies can also be filtered by Genre and Language.

### 📋 21. View All Bookings
Admins can open: `Admin → All Bookings`
Admins can view booking information such as Booking ID, User, Movie, Seats, Status, and Date. Bookings can also be searched and filtered.

---

## 📁 Project Structure

```text
movie_booking_application-
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   └── admin/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env.example
│   └── package.json
│
├── server/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## ⚠️ Troubleshooting

**❌ MongoDB connection error**
- Check `server/.env`. Make sure your `MONGO_URI` is correct.
- If you use MongoDB Atlas, also check: `MongoDB Atlas → Network Access → IP Address`.

**❌ Frontend cannot connect to backend**
- Make sure the backend is running (`cd server` -> `npm run dev`).
- Then check `client/.env`. It should contain `VITE_API_URL=http://localhost:5000/api`.
- After changing `.env`, restart the frontend.

**❌ Booking.find is not a function**
- This usually means there is a problem with the Booking Mongoose model.
- Check `server/models/Booking.js` and files that import `Booking`. Make sure the Booking model is exported and imported correctly.

**❌ Blank frontend page**
- Check Backend is running.
- Check Frontend is running.
- Check `client/.env` is correct.
- Open browser Developer Tools: Check the Console for errors, check the Network tab for failed API requests.

**❌ Port 5000 already in use**
- Change the backend port in `server/.env` (e.g., `PORT=5001`).
- Then change the frontend API URL in `client/.env` to: `VITE_API_URL=http://localhost:5001/api`.
- Restart both servers.

**❌ Port 5173 already in use**
- Vite normally selects another available port. Use the URL displayed in your terminal.

---

## 🔐 Security

Never share your `.env` file. It may contain:
- MongoDB username/password
- JWT secret
- Admin password
- API keys

Use `.env.example` when sharing the project.

---

## 💻 Useful Commands

### Backend (Run from `server/`)
- Install packages: `npm install`
- Start development server: `npm run dev`
- Start server normally: `npm start`

### Frontend (Run from `client/`)
- Install packages: `npm install`
- Start development server: `npm run dev`
- Build the application: `npm run build`
- Preview the production build: `npm run preview`

---

## 🔄 Running the Project After Setup

After the first setup, you only need two terminals.

**Terminal 1 — Backend**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend**
```bash
cd client
npm run dev
```

Then open: `http://localhost:5173`

---

## 🎯 Application Flow

```text
                    MOVIE BOOKING APP
                           │
              ┌────────────┴────────────┐
              │                         │
             USER                      ADMIN
              │                         │
        Browse Movies             Dashboard
              │                         │
         Select Show             Manage Movies
              │                         │
         Select Seats             Manage Shows
              │                         │
           Booking              All Bookings
              │
         My Bookings
              │
       ┌──────┼──────┐
       │      │      │
     Ticket Cancel  Status
                      │
               Notifications
```

---

## ✅ Final Checklist

Before using the application, make sure:

- [x] Node.js is installed
- [x] Git is installed
- [x] MongoDB is configured
- [x] `server/.env` is created
- [x] `client/.env` is created
- [x] Backend dependencies are installed
- [x] Frontend dependencies are installed
- [x] MongoDB is connected
- [x] Backend is running
- [x] Frontend is running
- [x] Admin account is available