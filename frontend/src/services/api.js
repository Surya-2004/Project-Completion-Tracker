import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD 
    ? '/api'  // In production, use relative path since backend serves frontend
    : 'http://localhost:5000/api', // In development, use localhost
});

export default api;