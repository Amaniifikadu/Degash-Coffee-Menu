import axios from 'axios';

const API = axios.create({
  baseURL: 'https://degash-coffee-menu.onrender.com/api',
});

export default API;