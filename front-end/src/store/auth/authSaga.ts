import { call, delay, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  clearAuthFeedback,
  forgotPasswordFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  loginFailure,
  loginRequest,
  loginSuccess,
  logout,
  registerFailure,
  registerRequest,
  registerSuccess,
  type ForgotPasswordPayload,
  type LoginPayload,
  type RegisterPayload,
} from "@/store/auth/authSlice";
import {
  setAuthToken,
  clearCurrentCustomerEmail,
  setCurrentCustomerEmail,
  setSessionUser,
} from "@/store/auth/authStorage";
import { formatBackendError } from "@/utils/apiError";

type LoginApiResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type RegisterApiResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

function* handleLogin(action: PayloadAction<LoginPayload>) {
  const { email, password } = action.payload;
  yield delay(250);

  if (!email || !password) {
    yield put(loginFailure("Email and password are required."));
    return;
  }

  try {
    const response: Response = yield call(() =>
      fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        })
      })
    );

    const responseBody: LoginApiResponse | { message?: string } = yield call(() => response.json());
    if (!response.ok) {
      const message =
        "message" in responseBody && responseBody.message
          ? responseBody.message
          : "Invalid email or password.";
      yield put(loginFailure(message));
      return;
    }

    const data = responseBody as LoginApiResponse;
    setAuthToken(data.token);
    setSessionUser({ id: data.user.id, name: data.user.name, email: data.user.email });
    setCurrentCustomerEmail(data.user.email);
    yield put(loginSuccess({ id: data.user.id, name: data.user.name, email: data.user.email }));
  } catch (error) {
    yield put(loginFailure(formatBackendError(error, "login request")));
  }
}

function* handleRegister(action: PayloadAction<RegisterPayload>) {
  const { name, email, password, confirmPassword } = action.payload;
  yield delay(250);

  if (!name || !email || !password || !confirmPassword) {
    yield put(registerFailure("All fields are required."));
    return;
  }

  if (password !== confirmPassword) {
    yield put(registerFailure("Password and confirm password must match."));
    return;
  }

  try {
    const response: Response = yield call(() =>
      fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password
        })
      })
    );

    const responseBody: RegisterApiResponse | { message?: string } = yield call(() => response.json());
    if (!response.ok) {
      const message =
        "message" in responseBody && responseBody.message
          ? responseBody.message
          : "Failed to register.";
      yield put(registerFailure(message));
      return;
    }

    const data = responseBody as RegisterApiResponse;
    setAuthToken(data.token);
    setSessionUser({ id: data.user.id, name: data.user.name, email: data.user.email });
    setCurrentCustomerEmail(data.user.email);
    yield put(registerSuccess({ id: data.user.id, name: data.user.name, email: data.user.email }));
  } catch (error) {
    yield put(registerFailure(formatBackendError(error, "registration request")));
  }
}

function* handleForgotPassword(action: PayloadAction<ForgotPasswordPayload>) {
  const { email, newPassword, confirmNewPassword } = action.payload;
  yield delay(250);

  if (!email || !newPassword || !confirmNewPassword) {
    yield put(forgotPasswordFailure("All fields are required."));
    return;
  }

  if (newPassword !== confirmNewPassword) {
    yield put(forgotPasswordFailure("New password and confirm password must match."));
    return;
  }

  try {
    const response: Response = yield call(() =>
      fetch("http://localhost:5000/api/auth/forgot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          newPassword,
          confirmNewPassword
        })
      })
    );

    const responseBody: { message?: string } = yield call(() => response.json());
    if (!response.ok) {
      const message = responseBody.message ?? "Forgot password failed.";
      yield put(forgotPasswordFailure(message));
      return;
    }

    yield put(
      forgotPasswordSuccess(
        responseBody.message ?? "Password reset successful. You can log in now."
      )
    );
  } catch (error) {
    yield put(forgotPasswordFailure(formatBackendError(error, "password reset request")));
  }
}

function* handleLogout() {
  clearCurrentCustomerEmail();
  yield put(clearAuthFeedback());
}

export function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(registerRequest.type, handleRegister);
  yield takeLatest(forgotPasswordRequest.type, handleForgotPassword);
  yield takeLatest(logout.type, handleLogout);
}
