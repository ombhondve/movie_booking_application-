const handleAddMovie = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await api.post("/movies", {
      title,
      genre,
      duration,     // number, in minutes
      language,
      description,
    });
    setMovies((prev) => [res.data, ...prev]);
  } catch (err) {
    setError(err.response?.data?.message || "Could not add movie");
  } finally {
    setLoading(false);
  }
};


const handleUpdateMovie = async (movieId, updatedFields) => {
  try {
    const res = await api.put(`/movies/${movieId}`, updatedFields);
    setMovies((prev) =>
      prev.map((m) => (m._id === movieId ? res.data : m))
    );
  } catch (err) {
    setError(err.response?.data?.message || "Could not update movie");
  }
};



const handleDeleteMovie = async (movieId) => {
  if (!window.confirm("Delete this movie?")) return;
  try {
    await api.delete(`/movies/${movieId}`);
    setMovies((prev) => prev.filter((m) => m._id !== movieId));
  } catch (err) {
    setError(err.response?.data?.message || "Could not delete movie");
  }
};