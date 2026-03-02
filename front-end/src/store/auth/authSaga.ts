import { delay, put, takeLatest } from "redux-saga/effects";
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
} from "./authSlice";
import {
  clearCurrentCustomerEmail,
  getStoredCustomers,
  saveStoredCustomers,
  setCurrentCustomerEmail,
} from "./authStorage";

function* handleLogin(action: PayloadAction<LoginPayload>) {
  const { email, password } = action.payload;
  yield delay(250);

  if (!email || !password) {
    yield put(loginFailure("Email and password are required."));
    return;
  }

  const customer = getStoredCustomers().find((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (!customer || customer.password !== password) {
    yield put(loginFailure("Invalid email or password."));
    return;
  }

  setCurrentCustomerEmail(customer.email);
  yield put(loginSuccess({ name: customer.name, email: customer.email }));
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

  const customers = getStoredCustomers();
  const alreadyExists = customers.some((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (alreadyExists) {
    yield put(registerFailure("An account with this email already exists."));
    return;
  }

  const updatedCustomers = [...customers, { name, email, password }];
  saveStoredCustomers(updatedCustomers);
  setCurrentCustomerEmail(email);
  yield put(registerSuccess({ name, email }));
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

  const customers = getStoredCustomers();
  const targetIndex = customers.findIndex((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (targetIndex < 0) {
    yield put(forgotPasswordFailure("No customer account found with this email."));
    return;
  }

  const updatedCustomers = [...customers];
  updatedCustomers[targetIndex] = {
    ...updatedCustomers[targetIndex],
    password: newPassword,
  };
  saveStoredCustomers(updatedCustomers);
  yield put(forgotPasswordSuccess("Password reset successful. You can log in now."));
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

