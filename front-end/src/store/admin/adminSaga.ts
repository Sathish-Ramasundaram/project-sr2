import { delay, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  adminLoginFailure,
  adminLoginRequest,
  adminLoginSuccess,
  adminLogout,
  type AdminLoginPayload,
} from "./adminSlice";
import { ADMIN_EMAIL, ADMIN_PASSWORD, clearAdminSession, setAdminSession } from "./adminStorage";

function* handleAdminLogin(action: PayloadAction<AdminLoginPayload>) {
  const { email, password } = action.payload;
  yield delay(250);

  if (!email || !password) {
    yield put(adminLoginFailure("Email and password are required."));
    return;
  }

  if (email.toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    yield put(adminLoginFailure("Invalid admin credentials."));
    return;
  }

  setAdminSession();
  yield put(adminLoginSuccess());
}

function* handleAdminLogout() {
  clearAdminSession();
}

export function* adminSaga() {
  yield takeLatest(adminLoginRequest.type, handleAdminLogin);
  yield takeLatest(adminLogout.type, handleAdminLogout);
}

