import axios from 'axios';

const authApi = axios.create({
  baseURL: 'http://localhost:3000/api/auth/',
  withCredentials: true,
});

export const registerApi = async ({ fullName, email, password }) => {
  const response = await authApi.post('/register', { fullName, email, password });
  return response.data;
};

export const loginApi = async ({ email, password }) => {
  const response = await authApi.post('/login', { email, password });
  return response.data;
};

export const getMeApi = async () => {
  const response = await authApi.get('/getMe');
  return response.data;
};

export const protectedRouteApi = async () => {
  const response = await authApi.get('/protectedRoute');
  return response.data;
};
