import axios from 'axios';
import { BACKEND_URL } from '../../../APIs/backend.api';

const meetingApi = axios.create({
    baseURL: `${BACKEND_URL}/api/meeting`,
    withCredentials: true,
})

export const getMeetingDetails = async (meetingId) => {
    const response = await meetingApi.get(`/details/${meetingId}`);
    return response.data;
}