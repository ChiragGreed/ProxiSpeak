import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMeetingId, setMeetingUsers } from '../state/meetingSlice.js';
import { getMeetingDetails } from '../services/meetingApi.js';

const useMeeting = () => {
    const dispatch = useDispatch();
    const { meetingId, meetingUsers } = useSelector((state) => state.meeting);

    const getMeetingDetailHandler = useCallback(async (requestedMeetingId) => {
        try {
            const meetingData = await getMeetingDetails(requestedMeetingId);
            dispatch(setMeetingId(meetingData.meeting._id));
            dispatch(setMeetingUsers(meetingData.meeting.users));
            return true;
        } catch (error) {
            console.error('Error fetching meeting details:', error);
            return false;
        }
    }, [dispatch]);

    return { meetingId, meetingUsers, getMeetingDetailHandler };
};

export default useMeeting;
