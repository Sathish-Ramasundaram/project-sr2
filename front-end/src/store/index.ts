import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import adminReducer from "./admin/adminSlice";
import authReducer from "./auth/authSlice";
import inventoryReducer from "./inventory/inventorySlice";
import { saveInventoryState } from "./inventory/inventoryStorage";
import rootSaga from "./rootSaga";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
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