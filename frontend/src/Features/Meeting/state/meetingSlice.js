import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  meetingId: null,
  meetingUsers: null,
  meetingerror: null,
};

const meetingSlice = createSlice({
  name: 'meeting',
  initialState,
  reducers: {
    setMeetingId(state, action) {
      state.meetingId = action.payload;
    },
    setMeetingUsers(state, action) {
      state.meetingUsers = action.payload;
    },
    setMeetingError(state, action) {
      state.meetingerror = action.payload;
    }
  },
});

export const { setMeetingId, setMeetingUsers, setMeetingError } = meetingSlice.actions;
export default meetingSlice.reducer;
