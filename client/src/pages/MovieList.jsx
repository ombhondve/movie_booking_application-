useEffect(() => {
  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/movies");
      setMovies(res.data);
    } catch (err) {
      setError("Could not load movies");
    } finally {
      setLoading(false);
    }
  };
  fetchMovies();
}, []);