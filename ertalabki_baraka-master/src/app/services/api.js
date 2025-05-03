import axios from 'axios';

// Global axios instansiyasini yaratish
const api = axios.create({
  baseURL: 'https://baraka30.pythonanywhere.com/api/', // API manzilingizni shu yerga kiriting
  timeout: 10000, // 10 soniya timeout
});

export default api;
