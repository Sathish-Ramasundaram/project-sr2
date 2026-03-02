import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getAdminSession } from "./adminStorage";

export type AdminLoginPayload = {
  email: string;
  password: string;
};

type AdminState = {
  isAuthenticated: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  info: string | null;
};

const initialState: AdminState = {
  isAuthenticated: getAdminSession(),
  status: "idle",
  error: null,
  info: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    adminLoginRequest: (state, _action: PayloadAction<AdminLoginPayload>) => {
      state.status = "loading";
      state.error = null;
      state.info = null;
    },
    adminLoginSuccess: (state) => {
      state.status = "succeeded";
      state.isAuthenticated = true;
      state.error = null;
      state.info = "Admin login successful.";
    },
    adminLoginFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
      state.info = null;
    },
    adminLogout: (state) => {
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
      state.info = null;
    },
    clearAdminFeedback: (state) => {
      state.error = null;
      state.info = null;
      if (state.status !== "loading") {
        state.status = "idle";
      }
    },
  },
});

export const {
  adminLoginRequest,
  adminLoginSuccess,
  adminLoginFailure,
  adminLogout,
  clearAdminFeedback,
} = adminSlice.actions;

export default adminSlice.reducer;

