const res1 = await api.get(`/movies/${movieId}`);
setMovie(res1.data);


const res = await api.get("/shows", { params: { movieId } });
setShows(res.data);

const res2 = await api.get(`/shows/${showId}`);
setShow(res.data);