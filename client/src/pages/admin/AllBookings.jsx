useEffect(() => {
  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/bookings/all");
      setBookings(res.data); // each has populated .user and .show.movie
    } catch (err) {
      setError("Could not load bookings");
    } finally {
      setLoading(false);
    }
  };
  fetchAllBookings();
}, []);