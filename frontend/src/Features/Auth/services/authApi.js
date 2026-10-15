import axios from 'axios';

const authApi = axios.create({
    baseURL: 'http://localhost:3000/api/auth/',
    withCredentials: true,
})

export const getMe = async () => {
    try {
        const response = await authApi.get('/getMe');
        return response.data;
    }
    catch (error) {
        console.error('Error fetching meeting users:', error);
    }
}