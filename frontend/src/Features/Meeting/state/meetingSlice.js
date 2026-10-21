import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  meetingId: null,
  meetingUsers: null,
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
  },
});

export const { setMeetingId, setMeetingUsers } = meetingSlice.actions;
export default meetingSlice.reducer;
