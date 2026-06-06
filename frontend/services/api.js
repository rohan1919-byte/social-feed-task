import axios from 'axios';

const API = axios.create({
  baseURL: "https://social-feed-backend-6po4.onrender.com/api",
});
export default API;



