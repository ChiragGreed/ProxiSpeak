import axios from 'axios';

const meetingApi = axios.create({
    baseURL: 'http://localhost:3000/api/meeting',
    withCredentials: true,
})

export const getMeetingDetails = async (meetingId) => {
    try {
        const response = await meetingApi.get(`/details/${meetingId}`);
        console.log(response);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching meeting details:', error);
    }
}