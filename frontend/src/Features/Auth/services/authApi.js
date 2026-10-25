import axios from 'axios';
import { BACKEND_URL } from '../../../APIs/backend.api';

const authApi = axios.create({
  baseURL: `${BACKEND_URL}/api/auth`,
  withCredentials: true,
});

export const registerApi = async ({ fullName, email, password }) => {
   console.log("Axios posting to:", `${BACKEND_URL}/api/auth/register`, "with body:", { fullName, email, password });
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
