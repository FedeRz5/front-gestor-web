// src/api/client.js
import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // la leemos de env
  withCredentials: true,                 // para mandar cookies de sesión
})

export default api
