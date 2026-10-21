import axios from 'axios';

const meetingApi = axios.create({
    baseURL: 'http://localhost:3000/api/meeting',
    withCredentials: true,
})

export const getMeetingDetails = async (meetingId) => {
    const response = await meetingApi.get(`/details/${meetingId}`);
    return response.data;
}