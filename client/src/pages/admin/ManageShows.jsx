const handleAddShow = async (e) => {
  e.preventDefault();
  try {
    const res = await api.post("/shows", {
      movie: movieId,       // Movie's _id
      date,                 // e.g. "2026-09-10"
      time,                 // e.g. "18:30"
      theatre,
      totalSeats,           // number
    });
    setShows((prev) => [res.data, ...prev]);
  } catch (err) {
    setError(err.response?.data?.message || "Could not create show");
  }
};

const res = await api.put(`/shows/${showId}`, { date, time, theatre, totalSeats });

await api.delete(`/shows/${showId}`);


const handleBookSeats = async () => {
  setLoading(true);
  setError("");
  try {
    const res = await api.post("/bookings", {
      showId,
      seatsBooked: selectedSeatCount, // number
    });
    navigate("/my-bookings");
  } catch (err) {
    // e.g. "Not enough seats available. Only 3 left."
    setError(err.response?.data?.message || "Booking failed");
  } finally {
    setLoading(false);
  }
};