import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface AuthState {
  token: string | null;
  refresh_token: string | null;
  email: string | null;
  role: string | null;
  userId: string | null;
  image?: string | null;
}


const initialState: AuthState = {
  token: null,
  refresh_token: null,
  email: null,
  role: null,
  userId: null,
  image: null, 
};


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        email: string;
        role: string;
        userId: string;
        image: string;
      }>
    ) => {
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.userId = action.payload.userId;
      state.image = action.payload.image;
    },

    setRefreshToken: (
      state,
      action: PayloadAction<{ refresh_token: string }>
    ) => {
      state.refresh_token = action.payload.refresh_token;
    },
    logout: (state) => {
      state.token = null;
      state.refresh_token = null;
      state.email = null;
      state.role = null;
      state.userId = null;
      Cookies.remove("token");
    },

  },
});

export const { setUser, setRefreshToken, logout } = authSlice.actions;

export default authSlice.reducer;
