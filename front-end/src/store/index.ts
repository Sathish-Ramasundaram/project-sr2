import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import adminReducer from "@/store/admin/adminSlice";
import authReducer from "@/store/auth/authSlice";
import cartReducer from "@/store/cart/cartSlice";
import inventoryReducer from "@/store/inventory/inventorySlice";
import { saveInventoryState } from "@/store/inventory/inventoryStorage";
import rootSaga from "@/store/rootSaga";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    cart: cartReducer,
    inventory: inventoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(sagaMiddleware),
});

store.subscribe(() => {
  saveInventoryState(store.getState().inventory);
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
