import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../Features/Auth/state/authSlice.js';
import meetingReducer from '../Features/Meeting/state/meetingSlice.js';

const reduxStore = configureStore({
  reducer: {
    auth: authReducer,
    meeting: meetingReducer,
  },
});

export default reduxStore;
