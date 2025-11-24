import api from "../api/axios";

// request returns { status: "success", token: "...", ... }
export async function loginRequest(username, password) {
  const res = await api.post("/login", { username, password });
  return res.data;
}
