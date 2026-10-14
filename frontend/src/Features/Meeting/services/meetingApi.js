import axios from 'axios';

const meetingApi = axios.create({
    baseURL: 'http://localhost:3000/api/meeting',
    withCredentials: true,
})

export const getMeetingUsers = async (meetingId) => {
    try {
        const response = await meetingApi.get(`/users/${meetingId}`);
        console.log(response);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching meeting users:', error);
    }
}