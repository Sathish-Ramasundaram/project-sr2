import { all, call } from "redux-saga/effects";
import { adminSaga } from "./admin/adminSaga";
import { authSaga } from "./auth/authSaga";

export default function* rootSaga() {
  yield all([call(authSaga), call(adminSaga)]);
}
