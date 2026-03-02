import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getSessionUser } from "./authStorage";

type AuthUser = {
  name: string;
  email: string;
};

export type AuthStatus = "idle" | "loading" | "succeeded" | "failed";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type ForgotPasswordPayload = {
  email: string;
  newPassword: string;
  confirmNewPassword: string;
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  error: string | null;
  info: string | null;
};

const sessionUser = getSessionUser();

const initialState: AuthState = {
  user: sessionUser,
  isAuthenticated: Boolean(sessionUser),
  status: "idle",
  error: null,
  info: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginRequest: (state, _action: PayloadAction<LoginPayload>) => {
      state.status = "loading";
      state.error = null;
      state.info = null;
    },
    loginSuccess: (state, action: PayloadAction<AuthUser>) => {
      state.status = "succeeded";
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      state.info = "Login successful.";
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
      state.info = null;
    },
    registerRequest: (state, _action: PayloadAction<RegisterPayload>) => {
      state.status = "loading";
      state.error = null;
      state.info = null;
    },
    registerSuccess: (state, action: PayloadAction<AuthUser>) => {
      state.status = "succeeded";
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      state.info = "Account created successfully.";
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
      state.info = null;
    },
    forgotPasswordRequest: (state, _action: PayloadAction<ForgotPasswordPayload>) => {
      state.status = "loading";
      state.error = null;
      state.info = null;
    },
    forgotPasswordSuccess: (state, action: PayloadAction<string>) => {
      state.status = "succeeded";
      state.error = null;
      state.info = action.payload;
    },
    forgotPasswordFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
      state.info = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
      state.info = null;
    },
    clearAuthFeedback: (state) => {
      state.error = null;
      state.info = null;
      if (state.status !== "loading") {
        state.status = "idle";
      }
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  logout,
  clearAuthFeedback,
} = authSlice.actions;

export default authSlice.reducer;

