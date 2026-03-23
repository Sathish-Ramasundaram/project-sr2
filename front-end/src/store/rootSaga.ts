import { all, call } from "redux-saga/effects";
import { authSaga } from "@/store/auth/authSaga";
import { cartSaga } from "@/store/cart/cartSaga";

export default function* rootSaga() {
  yield all([call(authSaga), call(cartSaga)]);
}
