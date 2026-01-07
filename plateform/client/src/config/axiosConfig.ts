import axios from "axios";

export const axiosConfig = axios.create({
    baseURL: "http://localhost:5001/api",
    withCredentials: true
});

axiosConfig.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});