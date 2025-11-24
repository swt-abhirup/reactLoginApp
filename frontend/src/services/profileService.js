import api from "../api/axios";

export async function getProfile() {
  // GET /me (axios instance already sets Authorization header in AuthContext)
  const res = await api.get("/me");
  return res.data; // { status: "success", user: {...} }
}

export async function updateProfile(data) {
  const res = await api.put("/profile/update", data);
  return res.data; // {status, message}
}
