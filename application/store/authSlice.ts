import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type AuthState = {
  token: string | null;
  user: string | null;
  role: string | null;
};

const initialState: AuthState = { token: null, user: null, role: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ token: string; user: string; role: string }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.role = action.payload.role;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.role = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
