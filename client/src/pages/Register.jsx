const handleRegister = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  try {
    const res = await api.post("/auth/register", {
      name,
      email,
      password,
      // role: "admin" // only include this while testing admin features locally
    });
    console.log(res.data.message); // "User registered successfully"
    navigate("/login");
  } catch (err) {
    setError(err.response?.data?.message || "Registration failed");
  } finally {
    setLoading(false);
  }
};