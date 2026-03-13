import { all, call } from "redux-saga/effects";
import { adminSaga } from "@/store/admin/adminSaga";
import { authSaga } from "@/store/auth/authSaga";
import { cartSaga } from "@/store/cart/cartSaga";

export default function* rootSaga() {
  yield all([call(adminSaga), call(authSaga), call(cartSaga)]);
}
