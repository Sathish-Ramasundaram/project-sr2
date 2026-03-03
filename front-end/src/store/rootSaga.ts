import { all, call } from "redux-saga/effects";
import { adminSaga } from "./admin/adminSaga";
import { authSaga } from "./auth/authSaga";
import { cartSaga } from "./cart/cartSaga";

export default function* rootSaga() {
  yield all([call(authSaga), call(adminSaga), call(cartSaga)]);
}
