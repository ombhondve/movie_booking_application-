import { useState } from 'react';
import ManageMovies from './ManageMovies';
import ManageShows from './ManageShows';
import AllBookings from './AllBookings';

export default function AdminDashboard() {
  const [tab, setTab] = useState('movies');

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <div className="tabs">
        <button className={tab === 'movies' ? 'active' : ''} onClick={() => setTab('movies')}>Movies</button>
        <button className={tab === 'shows' ? 'active' : ''} onClick={() => setTab('shows')}>Shows</button>
        <button className={tab === 'bookings' ? 'active' : ''} onClick={() => setTab('bookings')}>All Bookings</button>
      </div>

      {tab === 'movies' && <ManageMovies />}
      {tab === 'shows' && <ManageShows />}
      {tab === 'bookings' && <AllBookings />}
    </div>
  );
}
