import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  Loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentUser(state, action) {
      state.currentUser = action.payload;
    },
    setLoading(state, action) {
      state.Loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    }
  },
});

export const { setCurrentUser, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
