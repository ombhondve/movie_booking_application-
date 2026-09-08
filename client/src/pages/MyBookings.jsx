useEffect(() => {
  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/bookings/mine");
      setBookings(res.data); // each has populated .show.movie
    } catch (err) {
      setError("Could not load your bookings");
    } finally {
      setLoading(false);
    }
  };
  fetchMyBookings();
}, []);