const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  try {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user); // from AuthContext
    navigate(res.data.user.role === "admin" ? "/admin" : "/movies");
  } catch (err) {
    setError(err.response?.data?.message || "Invalid credentials");
  } finally {
    setLoading(false);
  }
};