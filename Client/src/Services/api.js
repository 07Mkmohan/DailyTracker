import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("authToken"); // ✅ use authToken
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const registerUser = (data) => API.post("/users/register", data);

export const loginUser = (data) => API.post("/users/login", data);

export const addEntry = (data) => API.post("/entries", data);
export const getEntries = () => API.get("/entries");
export const updateEntry = (id, data) => API.put(`/entries/${id}`, data);
export const deleteEntry = (id) => API.delete(`/entries/${id}`);

/* Admin */
export const getUsers = () => API.get("/users");
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
